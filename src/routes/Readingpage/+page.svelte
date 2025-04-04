<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../Header.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-16">
        <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-lg p-8 shadow-lg relative">
                {#if data.entry}
                    <!-- Action buttons -->
                    <div class="absolute top-4 right-4 flex gap-2">
                        <button class="p-2 hover:bg-gray-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="p-2 hover:bg-gray-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>

                    <!-- Content -->
                    <h1 class="text-2xl font-bold text-center mb-4">{data.entry.title}</h1>
                    <p class="text-gray-600 text-center mb-8">{data.entry.mood}</p>
                    <div class="prose max-w-none">
                        {data.entry.content}
                    </div>
                {:else}
                    <p class="text-center text-gray-600">No entry selected</p>
                {/if}
            </div>
        </div>
    </div>
</div>