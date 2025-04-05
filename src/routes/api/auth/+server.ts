import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
    try {
        const { email, password, action } = await request.json();

        if (!email || !password) {
            return json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (action === 'register') {
            // Check if user already exists
            const existingUser = await db.select().from(user).where(eq(user.email, email));
            if (existingUser.length > 0) {
                return json({ error: 'User already exists' }, { status: 400 });
            }

            // Create new user
            const newUser = await db.insert(user).values({
                email,
                password // Note: In a real app, you should hash the password
            }).returning();

            return json({ user: newUser[0] });
        } else if (action === 'login') {
            // Find user
            const users = await db.select().from(user).where(eq(user.email, email));
            if (users.length === 0) {
                return json({ error: 'User not found' }, { status: 400 });
            }

            const foundUser = users[0];
            
            // Check password (in a real app, you would hash and compare)
            if (foundUser.password !== password) {
                return json({ error: 'Invalid password' }, { status: 400 });
            }

            // Remove password from response
            const { password: _, ...userWithoutPassword } = foundUser;
            return json({ user: userWithoutPassword });
        } else {
            return json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        return json({ error: 'Server error' }, { status: 500 });
    }
} 