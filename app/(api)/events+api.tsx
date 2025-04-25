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
    const {name, bannerUrl, location, link, eventDate, eventTime, email, createdon, lat, lon, category} = await request.json();

    await ensureConnection();
    const result = await client.query(`
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
            '${category}'
        )
        `)

    return Response.json(result);
}
export async function GET(request: Request) {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      
      // Ако има подаден ID параметър
      if (id) {
        const eventId = parseInt(id, 10);
    
        if (isNaN(eventId)) {
          return new NextResponse('Invalid ID', { status: 400 });
        }
    
        await ensureConnection();
    
        const result = await client.query(
          `SELECT events.*, users.name as username 
           FROM events
           INNER JOIN users ON events.createdby = users.email
           WHERE events.id = $1`,
          [eventId]
        );
    
        if (result.rows.length === 0) {
          return new NextResponse('Event not found', { status: 404 });
        }
    
        return new NextResponse(JSON.stringify(result.rows[0]), { status: 200 });
      } 
      // Ако няма ID параметър, върни всички събития
      else {
        await ensureConnection();
  
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
        const id = url.searchParams.get("id"); // Извличаме ID от query параметрите
        const eventId = parseInt(id || "", 10); // Уверяваме се, че ID е число

        if (isNaN(eventId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, bannerUrl, location, eventDate, eventTime, category } = body;

        if (!name || !location || !eventDate || !eventTime || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Връзка с базата данни
        await ensureConnection();

        // Обновяване на събитието
        const updateResult = await client.query(
            `UPDATE events 
            SET name = $1,
                bannerurl = $2,
                location = $3,
                event_date = $4,
                event_time = $5,
                category = $6
            WHERE id = $7
            RETURNING *`,
            [name, bannerUrl, location, eventDate, eventTime, category, eventId]
        );
        console.log('Update parameters:', [name, bannerUrl, location, eventDate, eventTime, category, eventId]);

        if (updateResult.rows.length === 0) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(updateResult.rows[0], { status: 200 });

    } catch (error) {
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
