import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
    try {
        const users = await db.select().from(user);
        return new Response(JSON.stringify(users), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};