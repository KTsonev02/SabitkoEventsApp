import { client } from "@/configs/NilePostgresConfig";

export async function POST(request: Request) {
  const { name, email, image, role } = await request.json();
  console.log(name, email, image, role);  

  await client.connect();
  const result = await client.query(`
    INSERT INTO USERS (name, email, image, role)
    VALUES ('${name}', '${email}', '${image}', '${role}')
  `);
  await client.end();

  return Response.json(result);
}

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email');

  try {
    await client.connect();
    const result = await client.query(`
      SELECT *, role FROM users WHERE email = '${email}'
    `);
    await client.end();
    return Response.json(result.rows[0]);
  } catch (e) {
    return Response.json({ error: e });
  }
}
