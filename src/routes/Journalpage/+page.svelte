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

    interface User {
        id: number;
        email: string;
    }
    
    const state = $state({
        showModal: false,
        showViewModal: false,
        showEditModal: false,
        selectedJournal: null as Journal | null,
        title: '',
        mood: '',
        description: '',
        journals: [] as Journal[],
        error: '',
        isLoading: false,
        isDeleting: false
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
                fetchJournals();
            } else {
                throw new Error('No user data found');
            }
        } catch (err) {
            console.error('Error loading user:', err);
            goto('/');
        }
    });

    // Fetch journals on component mount
    async function fetchJournals() {
        if (!user?.id) return;
        
        try {
            const response = await fetch(`/api/journals?userId=${user.id}`);
            const data = await response.json();
            if (response.ok) {
                state.journals = data.journals;
            } else {
                state.error = data.error;
            }
        } catch (err) {
            state.error = 'Failed to fetch journals';
        }
    }

    function openModal() {
        state.showModal = true;
    }

    function closeModal() {
        state.showModal = false;
        state.title = '';
        state.mood = '';
        state.description = '';
        state.error = '';
    }

    function openViewModal(journal: Journal) {
        state.selectedJournal = journal;
        state.showViewModal = true;
    }

    function closeViewModal() {
        state.showViewModal = false;
        state.selectedJournal = null;
    }
    
    function openEditModal() {
        if (state.selectedJournal) {
            state.title = state.selectedJournal.title;
            state.mood = state.selectedJournal.mood;
            state.description = state.selectedJournal.description;
            state.showViewModal = false;
            state.showEditModal = true;
        }
    }
    
    function closeEditModal() {
        state.showEditModal = false;
        state.selectedJournal = null;
        state.title = '';
        state.mood = '';
        state.description = '';
        state.error = '';
    }

    async function handleSave() {
        if (!user?.id) {
            state.error = 'User not authenticated';
            return;
        }

        if (!state.title || !state.mood || !state.description) {
            state.error = 'Please fill in all fields';
            return;
        }

        state.isLoading = true;
        state.error = '';

        try {
            const response = await fetch('/api/journals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: state.title,
                    mood: state.mood,
                    description: state.description,
                    userId: user.id
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                state.journals = [...state.journals, data.journal];
                closeModal();
            } else {
                state.error = data.error;
            }
        } catch (err) {
            state.error = 'Failed to save journal';
        } finally {
            state.isLoading = false;
        }
    }

    async function handleUpdate() {
        if (!user?.id || !state.selectedJournal) {
            state.error = 'User not authenticated or journal not selected';
            return;
        }

        if (!state.title || !state.mood || !state.description) {
            state.error = 'Please fill in all fields';
            return;
        }

        state.isLoading = true;
        state.error = '';

        try {
            const response = await fetch(`/api/journals?id=${state.selectedJournal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: state.title,
                    mood: state.mood,
                    description: state.description,
                    userId: user.id
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                state.journals = state.journals.map(journal => 
                    journal.id === state.selectedJournal?.id ? data.journal : journal
                );
                closeEditModal();
            } else {
                state.error = data.error;
            }
        } catch (err) {
            state.error = 'Failed to update journal';
        } finally {
            state.isLoading = false;
        }
    }

    async function handleDelete() {
        if (!user?.id || !state.selectedJournal) {
            state.error = 'User not authenticated or journal not selected';
            return;
        }

        if (!confirm('Are you sure you want to delete this journal?')) {
            return;
        }

        state.isDeleting = true;

        try {
            const response = await fetch(`/api/journals?id=${state.selectedJournal.id}&userId=${user.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (response.ok) {
                state.journals = state.journals.filter(journal => journal.id !== state.selectedJournal?.id);
                closeViewModal();
            } else {
                state.error = data.error;
            }
        } catch (err) {
            state.error = 'Failed to delete journal';
        } finally {
            state.isDeleting = false;
        }
    }
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-8 px-4 sm:py-16">
        <div class="bg-[#8B0000] rounded-lg p-4 sm:p-6">
            <div class="flex justify-center">
                <div class="w-full max-w-6xl">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        <!-- Write New Entry Card -->
                        <button 
                            type="button"
                            on:click={openModal}
                            class="bg-gray-200 rounded-lg p-4 sm:p-8 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] cursor-pointer hover:bg-gray-300 transition-colors w-full border-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <div class="rounded-full border-2 border-black w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4">
                                <span class="text-3xl sm:text-4xl">+</span>
                            </div>
                            <div class="text-center font-medium text-sm sm:text-base">Write Something......</div>
                        </button>

                        <!-- Journal Cards -->
                        {#each state.journals as journal}
                            <button 
                                type="button"
                                on:click={() => openViewModal(journal)}
                                class="bg-gray-200 rounded-lg p-4 sm:p-8 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] cursor-pointer hover:bg-gray-300 transition-colors w-full border-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                <h2 class="text-lg sm:text-xl font-semibold mb-2 text-center">{journal.title}</h2>
                                <p class="text-sm sm:text-base text-gray-600 text-center">{journal.mood}</p>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Write Modal -->
{#if state.showModal}
    <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div class="fixed inset-0 bg-transparent" on:click={closeModal}></div>
        <div class="bg-[#1E1E1E] rounded-lg shadow-lg w-full max-w-[500px] p-4 sm:p-8 relative z-10">
            <h2 class="text-xl sm:text-2xl font-bold mb-4 text-white text-center">Create New Journal Entry</h2>
            
            {#if state.error}
                <div class="mb-4 p-3 bg-red-800 text-white rounded-md text-sm sm:text-base">
                    {state.error}
                </div>
            {/if}

            <input
                type="text"
                bind:value={state.title}
                placeholder="Enter title..."
                class="w-full p-2 mb-4 border bg-amber-100 border-gray-300 rounded text-sm sm:text-base"
            />
            <p class="text-base sm:text-lg text-white text-center font-medium mb-2">The Mood</p>
            <textarea
                bind:value={state.mood}
                placeholder="Write your mood..."
                class="w-full h-20 sm:h-24 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4 text-sm sm:text-base"
            ></textarea>
            <p class="text-base sm:text-lg text-white text-center font-medium mb-2">Description</p>
            <textarea
                bind:value={state.description}
                placeholder="Write your journal entry..."
                class="w-full h-40 sm:h-48 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4 text-sm sm:text-base"
            ></textarea>
            <div class="flex justify-center gap-4">
                <button
                    type="button"
                    on:click={handleSave}
                    disabled={state.isLoading}
                    class="px-6 sm:px-8 py-2 bg-[#8B0000] text-white rounded hover:bg-red-800 disabled:opacity-50 text-sm sm:text-base"
                >
                    {state.isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                    type="button"
                    on:click={closeModal}
                    class="px-6 sm:px-8 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- View Journal Modal -->
{#if state.showViewModal && state.selectedJournal}
    <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div class="fixed inset-0 bg-transparent" on:click={closeViewModal}></div>
        <div class="bg-[#1E1E1E] rounded-lg shadow-lg w-full max-w-[600px] max-h-[80vh] p-4 sm:p-8 overflow-y-auto relative z-10">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-white">{state.selectedJournal.title}</h2>
                <button 
                    type="button" 
                    on:click={closeViewModal}
                    class="text-gray-400 hover:text-white text-2xl font-bold"
                    aria-label="Close modal"
                >
                    ×
                </button>
            </div>
            
            <div class="mb-6">
                <h3 class="text-base sm:text-lg text-white font-medium mb-2">Mood</h3>
                <div class="bg-amber-100 p-3 sm:p-4 rounded">
                    <p class="text-sm sm:text-base">{state.selectedJournal.mood}</p>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="text-base sm:text-lg text-white font-medium mb-2">Journal Entry</h3>
                <div class="bg-amber-100 p-3 sm:p-4 rounded whitespace-pre-wrap">
                    <p class="text-sm sm:text-base">{state.selectedJournal.description}</p>
                </div>
            </div>
            
            <div class="text-gray-400 text-xs sm:text-sm">
                <p>Created: {new Date(state.selectedJournal.createdAt).toLocaleString()}</p>
            </div>
            
            <div class="mt-6 flex justify-center gap-4">
                <button
                    type="button"
                    on:click={openEditModal}
                    class="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
                >
                    Edit
                </button>
                <button
                    type="button"
                    on:click={handleDelete}
                    disabled={state.isDeleting}
                    class="px-4 sm:px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
                >
                    {state.isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                    type="button"
                    on:click={closeViewModal}
                    class="px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Edit Journal Modal -->
{#if state.showEditModal && state.selectedJournal}
    <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div class="fixed inset-0 bg-transparent" on:click={closeEditModal}></div>
        <div class="bg-[#1E1E1E] rounded-lg shadow-lg w-full max-w-[600px] max-h-[80vh] p-4 sm:p-8 overflow-y-auto relative z-10">
            <h2 class="text-xl sm:text-2xl font-bold mb-4 text-white text-center">Edit Journal Entry</h2>
            
            {#if state.error}
                <div class="mb-4 p-3 bg-red-800 text-white rounded-md text-sm sm:text-base">
                    {state.error}
                </div>
            {/if}

            <input
                type="text"
                bind:value={state.title}
                placeholder="Enter title..."
                class="w-full p-2 mb-4 border bg-amber-100 border-gray-300 rounded text-sm sm:text-base"
            />
            <p class="text-base sm:text-lg text-white text-center font-medium mb-2">The Mood</p>
            <textarea
                bind:value={state.mood}
                placeholder="Write your mood..."
                class="w-full h-20 sm:h-24 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4 text-sm sm:text-base"
            ></textarea>
            <p class="text-base sm:text-lg text-white text-center font-medium mb-2">Description</p>
            <textarea
                bind:value={state.description}
                placeholder="Write your journal entry..."
                class="w-full h-40 sm:h-48 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4 text-sm sm:text-base"
            ></textarea>
            <div class="flex justify-center gap-4">
                <button
                    type="button"
                    on:click={handleUpdate}
                    disabled={state.isLoading}
                    class="px-6 sm:px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                    {state.isLoading ? 'Updating...' : 'Update'}
                </button>
                <button
                    type="button"
                    on:click={closeEditModal}
                    class="px-6 sm:px-8 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
{/if}