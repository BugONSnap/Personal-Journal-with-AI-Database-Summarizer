<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../Header.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let { data }: { data: PageData } = $props();
    
    interface Journal {
        id: number;
        title: string;
        mood: string;
        description: string;
        userId: number;
        createdAt: Date;
    }

    const state = $state({
        journal: null as Journal | null,
        error: '',
        isLoading: true
    });

    onMount(async () => {
        try {
            const path = window.location.pathname;
            const journalId = path.split('/').pop();
            
            if (!journalId) {
                throw new Error('No journal ID provided');
            }

            const response = await fetch(`/api/journals/${journalId}`);
            const data = await response.json();
            
            if (response.ok) {
                state.journal = data.journal;
            } else {
                state.error = data.error;
            }
        } catch (err) {
            state.error = 'Failed to fetch journal entry';
            console.error(err);
        } finally {
            state.isLoading = false;
        }
    });
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-16">
        <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-lg p-8 shadow-lg relative">
                {#if state.isLoading}
                    <p class="text-center text-gray-600">Loading...</p>
                {:else if state.error}
                    <p class="text-center text-red-600">{state.error}</p>
                {:else if state.journal}
                    <!-- Action buttons -->
                    <div class="absolute top-4 right-4 flex gap-2">
                        <button 
                            class="p-2 hover:bg-gray-100 rounded-full"
                            on:click={() => goto(`/Journalpage`)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    </div>

                    <!-- Content -->
                    <h1 class="text-2xl font-bold text-center mb-4">{state.journal.title}</h1>
                    <p class="text-gray-600 text-center mb-8">{state.journal.mood}</p>
                    <div class="prose max-w-none">
                        {state.journal.description}
                    </div>
                {:else}
                    <p class="text-center text-gray-600">No entry found</p>
                {/if}
            </div>
        </div>
    </div>
</div>