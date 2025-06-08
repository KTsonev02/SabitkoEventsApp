import { NextResponse } from 'next/server';
import { Client } from 'pg';
import dayjs from 'dayjs';

const client = new Client({
  user: process.env.EXPO_PUBLIC_DB_USERNAME,
  password: process.env.EXPO_PUBLIC_DB_PASSWORD,
  host: "eu-central-1.db.thenile.dev",
  port: 5432,
  database: "sabitko_app",
});

let isClientConnected = false;
async function ensureConnection() {
  if (!isClientConnected) {
    await client.connect();
    isClientConnected = true;
    console.log("✅ PostgreSQL client connected.");
  }
}

// Помощна функция за форматиране на оставащо време до събитие
function formatTimeDiff(eventDate: string) {
  const now = dayjs();
  const event = dayjs(eventDate);
  const diffMinutes = event.diff(now, 'minute');

  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes - days * 24 * 60) / 60);
  const minutes = diffMinutes - days * 24 * 60 - hours * 60;

  let parts = [];
  if (days > 0) parts.push(`${days} ден${days > 1 ? 'а' : ''}`);
  if (hours > 0) parts.push(`${hours} час${hours > 1 ? 'а' : ''}`);
  if (minutes > 0) parts.push(`${minutes} минути`);

  return parts.join(' ');
}

// POST: Проверява за събития в следващите 49 часа и изпраща нотификации
export async function POST() {
  try {
    await ensureConnection();

    const fromDate = dayjs().toISOString();
    const toDate = dayjs().add(49, 'hour').toISOString();

    console.log(`🔍 Fetching events between ${fromDate} and ${toDate}`);

    const result = await client.query(
      `SELECT t.user_id, e.id as event_id, e.name, e.event_date
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE e.event_date BETWEEN $1 AND $2`,
      [fromDate, toDate]
    );

    if (result.rows.length === 0) {
      console.log("ℹ️ No upcoming events found.");
    }

    let notificationsSent = 0;
    let pushNotificationsSent = 0;

    for (const row of result.rows) {
      const { user_id, event_id, name, event_date } = row;

      // Проверка дали вече е изпратена нотификация за това събитие и потребител
      const check = await client.query(
        `SELECT 1 FROM notifications WHERE user_id = $1 AND event_id = $2`,
        [user_id, event_id]
      );

      if (check.rowCount === 0) {
        const timeLeft = formatTimeDiff(event_date);
        const msg = `Напомняне: Събитието "${name}" започва след ${timeLeft}.`;

        let pushSent = false;

        try {
          const tokenRes = await client.query(
            `SELECT token, device_notifications FROM push_tokens WHERE user_id = $1`,
            [user_id]
          );

          const token = tokenRes.rows[0]?.token;
          const notificationsEnabled = tokenRes.rows[0]?.device_notifications;

          if (token && token.startsWith("ExponentPushToken") && notificationsEnabled) {
            console.log(`📤 Sending push notification to user ${user_id}...`);

            const response = await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: token,
                sound: "default",
                title: "Събитие скоро",
                body: msg,
              }),
            });

            const data = await response.json();
            console.log(`📦 Push API response:`, data);

            if (data.data && data.data.status === 'ok') {
              pushSent = true;
              pushNotificationsSent++;
              console.log(`✅ Push notification sent to user ${user_id} for event ${event_id}`);
            } else {
              console.warn(`⚠️ Push notification failed for user ${user_id}:`, data);
            }
          } else {
            console.log(`ℹ️ No valid push token or notifications disabled for user ${user_id}`, {
              hasToken: !!token,
              tokenStartsWithExpo: token?.startsWith("ExponentPushToken"),
              notificationsEnabled
            });
          }

          console.log('📱 Push token details:', {
            userId: user_id,
            hasToken: !!token,
            tokenValid: token?.startsWith("ExponentPushToken"),
            notificationsEnabled,
            token: token ? `${token.substring(0, 10)}...` : 'none'
          });

        } catch (tokenErr) {
          console.error(`❌ Error fetching or sending push for user ${user_id}:`, tokenErr);
        }

        try {
          await client.query(
            `INSERT INTO notifications (user_id, event_id, message, sent)
             VALUES ($1, $2, $3, $4)`,
            [user_id, event_id, msg, pushSent]
          );
          notificationsSent++;
        } catch (insertErr) {
          console.error(`❌ Error inserting notification for user ${user_id}:`, insertErr);
        }
      } else {
        console.log(`🔁 Notification already sent to user ${user_id} for event ${event_id}`);
      }
    }

    return NextResponse.json({
      message: "Notifications processed successfully.",
      stats: {
        totalNotifications: notificationsSent,
        pushNotificationsSent,
        appNotifications: notificationsSent - pushNotificationsSent,
      },
    });
  } catch (err) {
    console.error("❌ Notification processing error:", err);
    return NextResponse.json({ error: "Failed to process notifications" }, { status: 500 });
  }
}

// GET: Връща всички нотификации за даден потребител
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await ensureConnection();

    const result = await client.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`📬 Notifications fetched for user ${userId}`);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ GET notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// DELETE: Изтрива нотификация по id
export async function DELETE(request: Request) {
  try {
    await ensureConnection();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    await client.query(
      `DELETE FROM notifications WHERE id = $1`,
      [id]
    );

    console.log(`🗑️ Notification with id ${id} deleted`);
    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("❌ Delete notification error:", err);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
