<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../Header.svelte';

    let { data }: { data: PageData } = $props();
    
    const state = $state({
        showModal: false,
        title: '',
        mood: ''
    });

    function openModal() {
        console.log('Opening modal...');
        state.showModal = true;
        console.log('Modal state:', state.showModal);
    }

    function closeModal() {
        state.showModal = false;
        state.title = '';
        state.mood = '';
    }

    function handleSave() {
        // TODO: Implement save functionality
        closeModal();
    }
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-16">
        <div class="bg-[#8B0000] rounded-lg p-6">
            <div class="flex justify-center">
                <div class="max-w-4xl w-full px-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Write New Entry Card -->
                        <button 
                            type="button"
                            on:click={openModal}
                            class="bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-gray-300 transition-colors w-full border-none focus:outline-none"
                        >
                            <div class="rounded-full border-2 border-black w-16 h-16 flex items-center justify-center mb-4">
                                <span class="text-4xl">+</span>
                            </div>
                            <div class="text-center font-medium">Write Something......</div>
                        </button>

                        <!-- Journal Title Card -->
                        <div class="bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center">
                            <h2 class="text-xl font-semibold mb-2 text-center">Title of the Journal</h2>
                            <p class="text-gray-600 text-center">The Mood</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal -->
{#if state.showModal}
    <div class="fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-[#1E1E1E] rounded-lg shadow-lg w-[500px] p-8">
            <h2 class="text-2xl font-bold mb-4 text-white text-center">The Title</h2>
            <input
                type="text"
                bind:value={state.title}
                placeholder="Enter title..."
                class="w-full p-2 mb-4 border bg-amber-100 border-gray-300 rounded"
            />
            <p class="text-lg text-white text-center font-medium mb-2">The Mood</p>
            <textarea
                bind:value={state.mood}
                placeholder="Write Something..."
                class="w-full h-48 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4"
            ></textarea>
            <div class="flex justify-center gap-4">
                <button
                    type="button"
                    on:click={handleSave}
                    class="px-8 py-2 bg-[#8B0000] text-white rounded hover:bg-red-800"
                >
                    Save
                </button>
                <button
                    type="button"
                    on:click={closeModal}
                    class="px-8 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}