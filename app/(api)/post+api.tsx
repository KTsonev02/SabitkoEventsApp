import { client } from "@/configs/NilePostgresConfig";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const {content, imageUrl, visibleIn, email} = await request.json();

    await client.connect();
    const result= await client.query(`insert into post
         values(DEFAULT, '${content}', '${imageUrl}', DEFAULT, '${email}', ${visibleIn});`);
    await client.end();
    

    return Response.json(result);
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const club = url.searchParams.get('club');
        const orderField = url.searchParams.get('orderField') || 'createdon'; // по подразбиране подреждаме по дата

        await client.connect();

        let query = `
            SELECT post.*, users.name as username, users.image as userprofileimage
            FROM post
            INNER JOIN users ON post.createdby = users.email
        `;

        // Строим динамично WHERE частта
        let conditions: string[] = [];
        if (id) {
            conditions.push(`post.id = ${id}`);
        }
        if (club) {
            conditions.push(`club IN (${club})`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY ${orderField} DESC`;

        const result = await client.query(query);
        await client.end();

        return new NextResponse(JSON.stringify(result.rows), { status: 200 });

    } catch (error) {
        console.error('❌ GET Error:', error);
        await client.end();
        return new NextResponse('Failed to fetch posts', { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new NextResponse('Post ID е задължителен', { status: 400 });
        }

        await client.connect();

        const result = await client.query(`DELETE FROM post WHERE id = ${id};`);

        await client.end();

        if (result.rowCount === 0) {
            return new NextResponse('Не е намерен пост с такова ID', { status: 404 });
        }

        return new NextResponse('Постът е успешно изтрит', { status: 200 });

    } catch (error) {
        console.error('❌ DELETE Error:', error);
        await client.end();
        return new NextResponse('Неуспешно изтриване на пост', { status: 500 });
    }
}