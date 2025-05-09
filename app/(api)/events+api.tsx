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
      await client.connect();  // Опитва се да се свърже към базата
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

  if (action === "createPaymentIntent") {
    try {
      const { amount } = await request.json();

      if (!amount || typeof amount !== "number") {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: "bgn", // Change to your currency
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

  const {
    name, bannerUrl, location, link,
    eventDate, eventTime, email, createdon,
    lat, lon, category, price, total_seats
  } = await request.json();

  await ensureConnection();

  try {
    // 1. Създаваме събитието
    const eventResult = await client.query(`
      INSERT INTO events VALUES(
        DEFAULT,
        '${name}',
        '${location}',
        '${link}',
        '${bannerUrl}',
        '${eventDate}',
        '${eventTime}',
        '${email}',
        '${createdon}',
        ${lat !== undefined ? lat : null},
        ${lon !== undefined ? lon : null},
        '${category}',
        '${price}',
        '${total_seats}'
      ) RETURNING id;
    `);
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
        // escape eventId and seat_number safely or use parametrизация
        seatValues.push(
          `(${eventId}, '${row}${n}')`
        );
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
    await ensureConnection();


    if (action === 'getTickets') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
    
      const result = await client.query(
        `
        SELECT 
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
        ORDER BY e.event_date ASC
        `,
        [userId]
      );
    
      const tickets = result.rows.map((row: any) => ({
        id: row.id,
        eventId: row.event_id, // Map event_id to eventId
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
        const action = url.searchParams.get("action"); // <- ВЗИМА action
        const eventId = parseInt(id || "", 10);

        if (isNaN(eventId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, bannerUrl, location, eventDate, eventTime, category, price, totalSeats, userId, seatIds } = body;

        // --- ЛОГИКА ЗА КУПУВАНЕ НА МЕСТА ---
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

            // Създаваме билети (ако имаш tickets таблица)
            for (const seatId of seatIds) {
                await client.query(
                    `INSERT INTO tickets (user_id, event_id, seat_id) VALUES ($1, $2, $3)`,
                    [userId, eventId, seatId]
                );
            }

            return NextResponse.json({ message: 'Seats successfully reserved!' }, { status: 200 });
        }
        // --- КРАЙ НА ЛОГИКАТА ЗА КУПУВАНЕ ---

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
        console.log('Update parameters:', [name, bannerUrl, location, eventDate, eventTime, category, price, totalSeats, eventId]);

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
    const result = await client.query(`
        DELETE FROM events WHERE id = ${id} RETURNING *;
    `);

    if (result.rows.length === 0) {
        return Response.json({ error: "Event not found" }, { status: 404 });
    }

    return Response.json({ message: "Event deleted successfully" });
}
