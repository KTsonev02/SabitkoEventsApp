import { client } from "@/configs/NilePostgresConfig";

export async function POST(request: Request) {

    const {eventName, bannerUrl, location, link, eventDate, eventTime, email}= await request.json();
    await client.connect();

    const result = await client.query(`
        INSERT INTO events VALUES(
        DEFAULT,
        '${eventName}',
        '${location}',
        '${link}',
        '${bannerUrl}',
        '${eventDate}',
        '${eventTime}',
        '${email}',
        DEFAULT
        )
        `)
    await client.end();
    return Response.json(result);
}

export async function GET() {
    await client.connect();
    const result = await client.query(`select events.*,users.name as username from events
inner join users
on events.createdby=users.email
order by id desc;`);
    await client.end();
    return Response.json(result.rows);
}