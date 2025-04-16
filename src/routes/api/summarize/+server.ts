import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { journal } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface JournalEntry {
    title: string;
    mood: string;
    description: string;
    date: string;
}

interface OllamaResponse {
    response: string;
    model: string;
    created_at: string;
    done: boolean;
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
}

export async function GET({ url }) {
    try {
        const userId = url.searchParams.get('userId');
        const query = url.searchParams.get('query') || '';
        
        if (!userId) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch all journals for the user
        const journals = await db.select().from(journal).where(eq(journal.userId, parseInt(userId)));
        
        if (journals.length === 0) {
            return json({ summary: "You haven't written any journal entries yet. Start journaling to see insights!" });
        }

        // Extract relevant information for summarization
        const journalData: JournalEntry[] = journals.map(entry => ({
            title: entry.title,
            mood: entry.mood,
            description: entry.description,
            date: new Date(entry.createdAt).toLocaleDateString()
        }));

        // Generate a summary using Ollama with Llama 3.2
        const summary = await generateSummaryWithOllama(journalData, query);
        
        return json({ summary, lastUpdated: new Date().toISOString() });
    } catch (error) {
        console.error('Summarization error:', error);
        return json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}

async function generateSummaryWithOllama(journalData: JournalEntry[], query: string): Promise<string> {
    try {
        // Prepare journal data for the prompt
        const journalSummary = prepareJournalSummary(journalData);
        
        // Create a prompt for the LLM
        const enhancedPrompt = createPrompt(journalData, journalSummary, query);
        
        // Call Ollama API
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: enhancedPrompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
        
    } catch (error) {
        console.error('Error calling Ollama:', error);
        // Fallback to basic summary if Ollama fails
        return generateBasicSummary(journalData);
    }
}

function createPrompt(journalData: JournalEntry[], journalSummary: string, query: string): string {
    // Base system prompt
    let prompt = `You are a helpful AI assistant analyzing personal journal entries. Your task is to provide insightful analysis of these journal entries.

Here's a summary of the journal data:
${journalSummary}

`;
    
    // Add specific instructions based on query or use default
    if (query) {
        prompt += `The user is asking: "${query}"

Please provide a thoughtful response to this question based on the journal data. Be empathetic, insightful, and helpful.`;
    } else {
        prompt += `Please analyze these journal entries and provide insights about:
1. Emotional patterns and mood trends
2. Common themes or topics
3. Any notable observations
4. Gentle suggestions for reflection or improvement

Keep your response conversational, empathetic, and focused on the journal content. Format your response in a clear, readable way.`;
    }
    
    return prompt;
}

function prepareJournalSummary(journalData: JournalEntry[]): string {
    // Create a concise summary of journal data for the LLM prompt
    let summary = `Total journal entries: ${journalData.length}\n`;
    
    // Add most recent entries (up to 5)
    const recentEntries = journalData.slice(-5);
    summary += `\nRecent journal entries (most recent ${recentEntries.length}):\n`;
    
    recentEntries.forEach((entry, index) => {
        summary += `\nEntry ${index + 1} (${entry.date}):\n`;
        summary += `Title: ${entry.title}\n`;
        summary += `Mood: ${entry.mood}\n`;
        summary += `Content: ${entry.description.substring(0, 200)}${entry.description.length > 200 ? '...' : ''}\n`;
    });
    
    // Add mood distribution
    const moodCounts: {[key: string]: number} = {};
    journalData.forEach(entry => {
        const mood = entry.mood.toLowerCase();
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    summary += `\nMood distribution:\n`;
    Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([mood, count]) => {
            summary += `- ${mood}: ${count} entries (${Math.round(count / journalData.length * 100)}%)\n`;
        });
    
    return summary;
}

function generateBasicSummary(journalData: JournalEntry[]): string {
    // Fallback summary generation if Ollama fails
    if (journalData.length === 0) {
        return "You haven't written any journal entries yet.";
    }
    
    // Count mood occurrences
    const moodCounts: {[key: string]: number} = {};
    journalData.forEach((entry: JournalEntry) => {
        const mood = entry.mood.toLowerCase();
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    // Find most common mood
    let mostCommonMood = '';
    let highestCount = 0;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > highestCount) {
            mostCommonMood = mood;
            highestCount = moodCounts[mood];
        }
    }
    
    // Get recent entries (last 5)
    const recentEntries = journalData.slice(-5);
    
    // Generate summary text
    let summary = `Based on your ${journalData.length} journal entries:\n\n`;
    
    if (mostCommonMood) {
        summary += `- Your most frequent mood is "${mostCommonMood}" (${highestCount} entries)\n`;
    }
    
    summary += `- You've journaled ${journalData.length} times\n`;
    summary += `- Your most recent entry was on ${recentEntries[recentEntries.length - 1].date}\n\n`;
    
    summary += "Recent themes in your entries:\n";
    
    // Extract some keywords from recent entries (simplified approach)
    const recentText = recentEntries.map((e: JournalEntry) => e.description).join(' ');
    const words = recentText.toLowerCase().split(/\W+/).filter((word: string) => 
        word.length > 4 && 
        !['about', 'after', 'again', 'their', 'there', 'these', 'those', 'would', 'could'].includes(word)
    );
    
    // Count word frequencies
    const wordCounts: {[key: string]: number} = {};
    words.forEach((word: string) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Get top 5 words
    const topWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
    
    if (topWords.length > 0) {
        summary += `- Common themes: ${topWords.join(', ')}\n`;
    }
    
    summary += "\nRecommendation: Continue journaling regularly to track your emotional patterns and growth.";
    
    return summary;
}
