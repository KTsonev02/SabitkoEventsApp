import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.EXPO_PUBLIC_DB_USERNAME,
  password: process.env.EXPO_PUBLIC_DB_PASSWORD,
  host: process.env.DB_HOST || "eu-central-1.db.thenile.dev",
  port: 5432,
  database: process.env.DB_NAME || "sabitko_app",
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    console.log("Push token request body:", body);

    const { userId, token, device_notifications } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Липсва userId или token" }, 
        { status: 400 }
      );
    }

    // Проверка за съществуващ запис
    const existing = await client.query(
      `SELECT * FROM push_tokens WHERE user_id = $1`, 
      [userId]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const existingRow = existing.rows[0];
      if (existingRow.token !== token || 
          existingRow.device_notifications !== device_notifications) {
        await client.query(
          `UPDATE push_tokens 
           SET token = $1, device_notifications = $2, updated_at = NOW() 
           WHERE user_id = $3`,
          [token, device_notifications, userId]
        );
        console.log("Token е обновен за user:", userId);
      }
    } else {
      await client.query(
        `INSERT INTO push_tokens 
         (user_id, token, device_notifications) 
         VALUES ($1, $2, $3)`,
        [userId, token, device_notifications]
      );
      console.log("Нов token е записан за user:", userId);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Push token е запазен успешно" 
    });

  } catch (error: any) {
    console.error("Грешка при запис на token:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Грешка при запазване на token",
        details: process.env.NODE_ENV === 'development' 
          ? error.message 
          : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}