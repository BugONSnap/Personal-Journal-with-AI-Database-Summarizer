<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../Header.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();
    
    interface User {
        id: number;
        email: string;
    }
    
    interface Message {
        content: string;
        isUser: boolean;
        timestamp: Date;
    }
    
    const state = $state({
        messages: [] as Message[],
        inputText: '',
        isLoading: false,
        error: '',
        summary: '',
        lastUpdated: null as Date | null,
        pollingInterval: null as number | null
    });
    
    // Get user from localStorage with validation
    let user: User | null = null;
    
    onMount(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                user = JSON.parse(userData);
                if (!user?.id) {
                    throw new Error('Invalid user data');
                }
                // Initial fetch of summary (but don't display it yet)
                fetchSummary();
                
                // Set up polling for real-time updates
                state.pollingInterval = setInterval(fetchSummary, 30000) as unknown as number; // Poll every 30 seconds
            } else {
                throw new Error('No user data found');
            }
        } catch (err) {
            console.error('Error loading user:', err);
            goto('/');
        }
    });
    
    onDestroy(() => {
        // Clear polling interval when component is destroyed
        if (state.pollingInterval !== null) {
            clearInterval(state.pollingInterval);
        }
    });
    
    async function fetchSummary(query: string = '') {
        if (!user?.id) return;
        
        try {
            state.isLoading = true;
            const response = await fetch(`/api/summarize?userId=${user.id}${query ? `&query=${encodeURIComponent(query)}` : ''}`);
            const data = await response.json();
            
            if (response.ok) {
                state.summary = data.summary;
                state.lastUpdated = new Date(data.lastUpdated);
            } else {
                state.error = data.error;
            }
        } catch (err) {
            state.error = 'Failed to fetch summary';
            console.error('Error fetching summary:', err);
        } finally {
            state.isLoading = false;
        }
    }
    
    function handleUserInput() {
        if (!state.inputText.trim()) return;
        
        // Add user message
        state.messages.push({
            content: state.inputText,
            isUser: true,
            timestamp: new Date()
        });
        
        const userQuery = state.inputText;
        state.inputText = '';
        
        // Process user query and respond
        processUserQuery(userQuery);
    }
    
    async function processUserQuery(query: string) {
        // Show typing indicator
        state.isLoading = true;
        
        try {
            let response = '';
            const lowerQuery = query.toLowerCase();
            
            // Handle special commands directly
            if (lowerQuery.includes('refresh') || lowerQuery.includes('update')) {
                await fetchSummary();
                response = "I've refreshed your journal insights with the latest data!";
            } 
            else if (lowerQuery.includes('help') || lowerQuery.includes('what can you')) {
                response = "I can provide AI-powered insights about your journal entries using Llama 3.2. Try asking about your moods, recent entries, or common themes. I automatically update every 30 seconds to reflect your latest journal entries.";
            }
            else {
                // For all other queries, use the Ollama-powered API
                await fetchSummary(query);
                response = state.summary || "I couldn't analyze your journal entries at this time. Please try again later.";
            }
            
            // Add AI response
            state.messages.push({
                content: response,
                isUser: false,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error processing query:', error);
            
            // Add error response
            state.messages.push({
                content: "I'm having trouble analyzing your journals right now. Please try again later.",
                isUser: false,
                timestamp: new Date()
            });
        } finally {
            state.isLoading = false;
        }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleUserInput();
        }
    }
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-16">
        <div class="bg-white rounded-lg shadow-lg max-w-4xl mx-auto min-h-[600px] flex flex-col">
            <div class="text-center p-6 border-b">
                <h1 class="text-4xl font-bold">Personal Journal</h1>
                <h2 class="text-2xl font-medium">Summarizer</h2>
                {#if state.lastUpdated}
                    <p class="text-sm text-gray-500 mt-1">Last updated: {state.lastUpdated.toLocaleTimeString()}</p>
                {/if}
            </div>
            
            <div class="flex-1 p-6 overflow-y-auto flex flex-col space-y-4" style="max-height: 400px;">
                {#each state.messages as message}
                    <div class={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div class={`max-w-[80%] p-3 rounded-lg ${message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <div class="whitespace-pre-wrap">{message.content}</div>
                            <div class="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                {/each}
                
                {#if state.isLoading}
                    <div class="flex justify-start">
                        <div class="bg-gray-200 p-3 rounded-lg">
                            <div class="flex space-x-2">
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            
            <div class="p-4 border-t">
                <div class="bg-gray-900 rounded-full flex">
                    <input 
                        type="text" 
                        bind:value={state.inputText}
                        onkeydown={handleKeyDown}
                        placeholder="Ask about your journal insights..." 
                        class="w-full bg-transparent text-white py-3 px-4 rounded-full text-lg focus:outline-none"
                    />
                    <button 
                        onclick={handleUserInput}
                        class="bg-blue-600 text-white rounded-full px-4 py-2 m-1 hover:bg-blue-700 transition"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>