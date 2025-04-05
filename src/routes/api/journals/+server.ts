import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { journal } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
    try {
        const { title, mood, description, userId } = await request.json();

        if (!title || !mood || !description || !userId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newJournal = await db.insert(journal).values({
            title,
            mood,
            description,
            userId
        }).returning();

        return json({ journal: newJournal[0] });
    } catch (error) {
        return json({ error: 'Failed to create journal' }, { status: 500 });
    }
}

export async function GET({ url }) {
    try {
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        const journals = await db.select().from(journal).where(eq(journal.userId, parseInt(userId)));
        return json({ journals });
    } catch (error) {
        return json({ error: 'Failed to fetch journals' }, { status: 500 });
    }
} 