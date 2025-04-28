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
    } else if (action === "add_comment") {
        if (!content || !email) {
            return new NextResponse(JSON.stringify({
                error: "Съдържанието и имейлът са задължителни"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    
        try {
            await client.query(`
                INSERT INTO comments (post_id, created_on, content, user_id)
                VALUES (${postId}, CURRENT_TIMESTAMP, '${content}', '${email}')
            `);
        
            return new NextResponse(JSON.stringify({
                success: true,
                message: "Коментарът е добавен успешно"
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new NextResponse(JSON.stringify({
                error: "Грешка в базата данни",
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
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
      const orderField = url.searchParams.get('orderField') || 'createdon';
  
      await client.connect();
  
      let query = `
      SELECT post.*, users.name as username, users.image as userprofileimage, users.email as useremail
      FROM post
      INNER JOIN users ON post.createdby = users.email
    `;
    
  
      let conditions: string[] = [];
      if (id) conditions.push(`post.id = ${id}`);
      if (club) conditions.push(`club IN (${club})`);
  
      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }
  
      query += ` ORDER BY ${orderField} DESC`;
  
      const result = await client.query(query);
  
      // 👇 Ключова промяна: Взимаме коментарите с JOIN към users
      if (id) {
        const commentsQuery = `
          SELECT 
            c.*, 
            u.name as username,
            u.image as userimage
          FROM 
            comments c
          JOIN 
            users u ON c.user_id = u.email  -- Важно: Проверете дали user_id съдържа email или id!
          WHERE 
            c.post_id = ${id}
          ORDER BY 
            c.created_on DESC
        `;
        const commentsResult = await client.query(commentsQuery);
        result.rows[0].comments = commentsResult.rows;  // Добавяме коментарите към поста
      }
  
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
