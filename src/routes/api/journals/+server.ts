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

export async function PUT({ request, url }) {
    try {
        const journalId = url.searchParams.get('id');
        
        if (!journalId) {
            return json({ error: 'Journal ID is required' }, { status: 400 });
        }
        
        const { title, mood, description, userId } = await request.json();

        if (!title || !mood || !description || !userId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // First check if the journal exists and belongs to the user
        const existingJournal = await db.select()
            .from(journal)
            .where(eq(journal.id, parseInt(journalId)))
            .limit(1);

        if (existingJournal.length === 0) {
            return json({ error: 'Journal not found' }, { status: 404 });
        }

        if (existingJournal[0].userId !== parseInt(userId)) {
            return json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update the journal
        const updatedJournal = await db.update(journal)
            .set({
                title,
                mood,
                description
            })
            .where(eq(journal.id, parseInt(journalId)))
            .returning();

        return json({ journal: updatedJournal[0] });
    } catch (error) {
        return json({ error: 'Failed to update journal' }, { status: 500 });
    }
}

export async function DELETE({ url }) {
    try {
        const journalId = url.searchParams.get('id');
        const userId = url.searchParams.get('userId');
        
        if (!journalId || !userId) {
            return json({ error: 'Journal ID and User ID are required' }, { status: 400 });
        }

        // First check if the journal exists and belongs to the user
        const existingJournal = await db.select()
            .from(journal)
            .where(eq(journal.id, parseInt(journalId)))
            .limit(1);

        if (existingJournal.length === 0) {
            return json({ error: 'Journal not found' }, { status: 404 });
        }

        if (existingJournal[0].userId !== parseInt(userId)) {
            return json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete the journal
        await db.delete(journal)
            .where(eq(journal.id, parseInt(journalId)));

        return json({ success: true });
    } catch (error) {
        return json({ error: 'Failed to delete journal' }, { status: 500 });
    }
}