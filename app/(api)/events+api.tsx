import { client } from "@/configs/NilePostgresConfig";

let isClientConnected = false;

async function ensureConnection() {
  if (!isClientConnected) {
    await client.connect();
    isClientConnected = true;
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
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    // Ако има ID параметър, върни конкретно събитие
    if (id) {
        try {
            const eventId = parseInt(id, 10);
            await ensureConnection();            
            const result = await client.query({
                text: `SELECT events.*, users.name as username 
                       FROM events
                       INNER JOIN users ON events.createdby = users.email
                       WHERE events.id = $1`,
                values: [id]
            });

            if (result.rows.length === 0) {
                return Response.json({ error: "Event not found" }, { status: 404 });
            }

            return Response.json(result.rows[0]);
        } catch (error) {
            console.error("GET by ID Error:", error);
            return Response.json({ error: "Failed to fetch event" }, { status: 500 });
        } finally {
        }
    }
    
    // Ако няма ID параметър, върни всички събития (оригиналната функционалност)
    try {
        await ensureConnection();        const result = await client.query(`SELECT events.*, users.name as username 
                                         FROM events
                                         INNER JOIN users ON events.createdby = users.email
                                         ORDER BY id DESC`);
        return Response.json(result.rows);
    } catch (error) {
        console.error("GET all Error:", error);
        return Response.json({ error: "Failed to fetch events" }, { status: 500 });
    } finally {
    }
}

export async function PATCH(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
        return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    try {
        const { 
            name: eventName, 
            bannerUrl, 
            location, 
            link, 
            eventDate, 
            eventTime, 
            lat, 
            lon, 
            category 
        } = await request.json();

        await ensureConnection();
        // Parameterized query за сигурност
        const result = await client.query({
            text: `
                UPDATE events SET
                    name = $1,
                    location = $2,
                    link = $3,
                    bannerurl = $4,
                    event_date = $5,
                    event_time = $6,
                    category = $7,
                    lat = $8,
                    lon = $9
                WHERE id = $10
                RETURNING *;
            `,
            values: [
                eventName,
                location,
                link,
                bannerUrl,
                eventDate,
                eventTime,
                category,
                lat !== undefined ? lat : null,
                lon !== undefined ? lon : null,
                id
            ]
        });

        if (result.rows.length === 0) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error("PATCH Error:", error);
        return Response.json({ error: "Failed to update event" }, { status: 500 });
    } finally {
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

