import { client } from "@/configs/NilePostgresConfig";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    const { action, postId, content, imageUrl, visibleIn, email } = await request.json();

    await client.connect();

    if (action === "like") {
        const alreadyLiked = await client.query(`
            SELECT * FROM likes
            WHERE post_id = '${postId}' AND user_id = '${email}'
        `);

        if (alreadyLiked.rows.length === 0) {
            // Потребителят още НЕ е лайкнал → позволяваме лайк
            await client.query(`
                INSERT INTO likes (post_id, user_id, createdon)
                VALUES ('${postId}', '${email}', CURRENT_TIMESTAMP)
            `);

            await client.query(`
                UPDATE post
                SET likes_count = COALESCE(likes_count, 0) + 1
                WHERE id = '${postId}'
            `);
        } else {
            console.log("Потребителят вече е лайкнал този пост");
        }

    } else if (action === "unlike") {
        const alreadyLiked = await client.query(`
            SELECT * FROM likes
            WHERE post_id = '${postId}' AND user_id = '${email}'
        `);

        if (alreadyLiked.rows.length > 0) {
            // Потребителят е лайкнал → позволяваме анлайк
            await client.query(`
                DELETE FROM likes
                WHERE post_id = '${postId}' AND user_id = '${email}'
            `);

            await client.query(`
                UPDATE post
                SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
                WHERE id = '${postId}'
            `);
        } else {
            console.log("Потребителят не е лайкнал този пост, за да го анлайкне");
        }

    } else {
        // Създаване на нов пост
        await client.query(`
            INSERT INTO post (id, content, imageurl, createdon, createdby, club)
            VALUES (DEFAULT, '${content}', '${imageUrl}', DEFAULT, '${email}', ${visibleIn});
        `);
    }

    await client.end();
    return new NextResponse('Успешно', { status: 200 });
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
