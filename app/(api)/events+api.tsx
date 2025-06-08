import { NextResponse } from 'next/server';
import { Client } from 'pg';

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
    try {
      await client.connect();
      isClientConnected = true;
      console.log("✅ Successfully connected to the database");
    } catch (error) {
      console.error("❌ Connection error:", error);
      throw new Error("Failed to connect to the database");
    }
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // Нова логика за добавяне/премахване на любими
  if (action === "toggleFavorite") {
    try {
      const { eventId, userId } = await request.json();
      
      if (!eventId || !userId) {
        return NextResponse.json({ error: "Missing eventId or userId" }, { status: 400 });
      }

      await ensureConnection();

      // Проверка дали събитието вече е в любими
      const checkResult = await client.query(
        `SELECT id FROM favorites WHERE event_id = $1 AND user_id = $2`,
        [eventId, userId]
      );

      if (checkResult.rows.length > 0) {
        // Премахване от любими
        await client.query(
          `DELETE FROM favorites WHERE id = $1`,
          [checkResult.rows[0].id]
        );
        return NextResponse.json({ isFavorite: false }, { status: 200 });
      } else {
        // Добавяне към любими
        const insertResult = await client.query(
          `INSERT INTO favorites (event_id, user_id, created_at) 
           VALUES ($1, $2, NOW()) RETURNING id`,
          [eventId, userId]
        );
        return NextResponse.json({ isFavorite: true }, { status: 200 });
      }
    } catch (error) {
      console.error("❌ Favorite toggle error:", error);
      return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
    }
  }

  if (action === "createPaymentIntent") {
  try {
    const { amount } = await request.json();

    if (amount === 0) {
      return NextResponse.json({ clientSecret: null, free: true }, { status: 200 });
    }

    if (!amount || typeof amount !== "number") {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "bgn",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("❌ Stripe Payment Intent Error:", error);
    return NextResponse.json({ error: "Failed to create Payment Intent" }, { status: 500 });
  }
}

  // Оригинална логика за създаване на събитие
  const {
    name, bannerUrl, location, link,
    eventDate, eventTime, email, createdon,
    lat, lon, category, price, total_seats
  } = await request.json();

  await ensureConnection();

  try {
    // 1. Създаваме събитието
    const eventResult = await client.query(
      `INSERT INTO events (
        name, location, link, bannerurl, 
        event_date, event_time, createdby, createdon,
        lat, lon, category, price, total_seats
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING id`,
      [
        name, location, link, bannerUrl,
        eventDate, eventTime, email, createdon,
        lat !== undefined ? lat : null, 
        lon !== undefined ? lon : null,
        category, price, total_seats
      ]
    );
    const eventId = eventResult.rows[0].id;

    // 2. Генерираме масив от букви за редовете
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const seatsPerRow = 6;
    const total = Number(total_seats);
    const numRows = Math.ceil(total / seatsPerRow);
    const rows = alphabet.slice(0, numRows);

    // 3. Сглобяваме INSERT заявката за всички места
    const seatValues: string[] = [];
    let count = 0;
    for (const row of rows) {
      for (let n = 1; n <= seatsPerRow && count < total; n++) {
        count++;
        seatValues.push(`(${eventId}, '${row}${n}')`);
      }
    }

    if (seatValues.length > 0) {
      const insertSeatsSQL = `
        INSERT INTO seats (event_id, seat_number)
        VALUES ${seatValues.join(", ")};
      `;
      await client.query(insertSeatsSQL);
      console.log(`🎟️ ${seatValues.length} seats created for event ${eventId}`);
    }

    return NextResponse.json({ message: "Event and seats created successfully", eventId });
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json({ error: "Failed to create event and seats" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('userId');
    await ensureConnection();

    // Логика за извличане на любими събития
    if (action === 'getFavorites') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }

      const result = await client.query(
        `SELECT e.*, u.name as username 
         FROM events e
         JOIN favorites f ON e.id = f.event_id
         JOIN users u ON e.createdby = u.email
         WHERE f.user_id = $1
         ORDER BY e.event_date ASC`,
        [userId]
      );

      return NextResponse.json(result.rows, { status: 200 });
    }

    // Проверка дали събитието е в любими
    if (action === 'checkFavorite') {
      const eventId = url.searchParams.get('eventId');
      if (!userId || !eventId) {
        return NextResponse.json({ error: 'Missing userId or eventId' }, { status: 400 });
      }

      const result = await client.query(
        `SELECT id FROM favorites WHERE event_id = $1 AND user_id = $2`,
        [eventId, userId]
      );

      return NextResponse.json({ isFavorite: result.rows.length > 0 }, { status: 200 });
    }

    // Логика за билетите на потребителя
    if (action === 'getTickets') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
    
      const result = await client.query(
        `SELECT 
          t.id, 
          t.event_id,
          e.name AS event_name, 
          e.event_date, 
          e.bannerurl AS event_image, 
          e.location AS venue,         
          e.category AS category,     
          s.seat_number
        FROM tickets t
        JOIN events e ON t.event_id = e.id
        LEFT JOIN seats s ON t.seat_id = s.id
        WHERE t.user_id = $1
        ORDER BY e.event_date ASC`,
        [userId]
      );
    
      const tickets = result.rows.map((row: any) => ({
        id: row.id,
        eventId: row.event_id,
        eventName: row.event_name,
        eventDate: row.event_date,
        eventImage: row.event_image,  
        venue: row.venue,            
        category: row.category,      
        seatNumber: row.seat_number || 'General',
      }));
    
      return NextResponse.json(tickets, { status: 200 });
    }

    // Ако има подаден ID параметър => Връщаме едно събитие + неговите седалки
    if (id) {
      const eventId = parseInt(id, 10);

      if (isNaN(eventId)) {
        return new NextResponse('Invalid ID', { status: 400 });
      }

      // 1. Взимаме събитието
      const eventResult = await client.query(
        `SELECT events.*, users.name as username 
         FROM events
         INNER JOIN users ON events.createdby = users.email
         WHERE events.id = $1`,
        [eventId]
      );

      if (eventResult.rows.length === 0) {
        return new NextResponse('Event not found', { status: 404 });
      }

      const event = eventResult.rows[0];

      // 2. Взимаме седалките за това събитие
      const seatsResult = await client.query(
        `SELECT id, seat_number, user_id
         FROM seats
         WHERE event_id = $1
         ORDER BY seat_number ASC`,
        [eventId]
      );

      // 3. Добавяме седалките към обекта на събитието
      event.seats = seatsResult.rows;

      return new NextResponse(JSON.stringify(event), { status: 200 });
    } 

    // Ако няма ID параметър => Връщаме всички събития (без седалки)
    else {
      const result = await client.query(
        `SELECT events.*, users.name as username 
         FROM events
         INNER JOIN users ON events.createdby = users.email
         ORDER BY id DESC`
      );

      return new NextResponse(JSON.stringify(result.rows), { status: 200 });
    }

  } catch (error) {
    console.error('❌ GET Error:', error);
    return new NextResponse('Failed to fetch events', { status: 500 });
  } finally {
    await client.end();
  }
}
  
export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id"); 
        const action = url.searchParams.get("action");
        const eventId = parseInt(id || "", 10);

        if (isNaN(eventId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, bannerUrl, location, eventDate, eventTime, category, price, totalSeats, userId, seatIds } = body;

        // Логика за купуване на места
        if (action === 'buy') {
            if (!userId || !seatIds || !Array.isArray(seatIds)) {
                return NextResponse.json({ error: 'Missing userId or seatIds' }, { status: 400 });
            }

            await ensureConnection();

            const seatPlaceholders = seatIds.map((_, index) => `$${index + 3}`).join(', ');

            // Резервираме местата ако са свободни
            const reserveQuery = `
                UPDATE seats
                SET user_id = $1
                WHERE event_id = $2 AND id IN (${seatPlaceholders}) AND user_id IS NULL
                RETURNING id;
            `;
            const reserveResult = await client.query(reserveQuery, [userId, eventId, ...seatIds]);

            if (reserveResult.rowCount !== seatIds.length) {
                return NextResponse.json({ error: 'One or more seats are already taken' }, { status: 409 });
            }

            // Създаваме билети
            for (const seatId of seatIds) {
                await client.query(
                    `INSERT INTO tickets (user_id, event_id, seat_id) VALUES ($1, $2, $3)`,
                    [userId, eventId, seatId]
                );
            }

            return NextResponse.json({ message: 'Seats successfully reserved!' }, { status: 200 });
        }

        if (!name || !location || !eventDate || !eventTime || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await ensureConnection();

        const updateResult = await client.query(
            `UPDATE events 
            SET name = $1,
                bannerurl = $2,
                location = $3,
                event_date = $4,
                event_time = $5,
                category = $6,
                price = $7,
                total_seats = $8
            WHERE id = $9
            RETURNING *`,
            [name, bannerUrl, location, eventDate, eventTime, category, price, totalSeats, eventId]
        );

        if (updateResult.rows.length === 0) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(updateResult.rows[0], { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    if (!id) {
        return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    await ensureConnection();
    const result = await client.query(
        `DELETE FROM events WHERE id = $1 RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return Response.json({ error: "Event not found" }, { status: 404 });
    }

    return Response.json({ message: "Event deleted successfully" });
}