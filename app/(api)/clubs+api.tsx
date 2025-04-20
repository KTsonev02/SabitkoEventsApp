import { client } from "@/configs/NilePostgresConfig";

export async function GET (request: Response) {
    await client.connect();
    const result = await client.query(`select * from clubs order by name asc `)
    await client.end();
    
    return Response.json(result.rows)
}   



export async function POST(request: Response) {
  const { imageUrl, clubName, about, emai } = await request.json();
  await client.connect();

  const result = await client.query(
    `insert into clubs (name, club_logo, about, createdon) values ('${clubName}', '${imageUrl}', '${about}', '${emai}')`
  );
  
    await client.end();
    return Response.json(result.rows)
}
