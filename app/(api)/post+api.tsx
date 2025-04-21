import { client } from "@/configs/NilePostgresConfig";

export async function POST(request: Request) {
    const {content, imageUrl, visibleIn, email} = await request.json();

    await client.connect();
    const result= await client.query(`insert into post
         values(DEFAULT, '${content}', '${imageUrl}', DEFAULT, '${email}', ${visibleIn});`);
    await client.end();
    

    return Response.json(result);
}

export async function GET(request: Request) {
    const club = new URL(request.url).searchParams.get('club');
    const orderField = new URL(request.url).searchParams.get('orderField');

    await client.connect();
    const result= await client.query(`select * from post 
                                    inner join users
                                    on post.createdby=users.email
                                    where club in (${club}) order by ${orderField} desc;`)
    await client.end();
    

    return Response.json(result.rows);
}