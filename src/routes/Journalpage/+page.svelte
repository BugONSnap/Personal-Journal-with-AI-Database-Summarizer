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
                // Update the journal in the journals array
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
                // Remove the journal from the journals array
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
                            onclick={openModal}
                            class="bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-gray-300 transition-colors w-full border-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <div class="rounded-full border-2 border-black w-16 h-16 flex items-center justify-center mb-4">
                                <span class="text-4xl">+</span>
                            </div>
                            <div class="text-center font-medium">Write Something......</div>
                        </button>

                        <!-- Journal Cards -->
                        {#each state.journals as journal}
                            <button 
                                type="button"
                                class="bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors w-full border-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                                onclick={() => openViewModal(journal)}
                            >
                                <h2 class="text-xl font-semibold mb-2 text-center">{journal.title}</h2>
                                <p class="text-gray-600 text-center">{journal.mood}</p>
                            </button>
                        {/each}
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
            <h2 class="text-2xl font-bold mb-4 text-white text-center">Create New Journal Entry</h2>
            
            {#if state.error}
                <div class="mb-4 p-3 bg-red-800 text-white rounded-md">
                    {state.error}
                </div>
            {/if}

            <input
                type="text"
                bind:value={state.title}
                placeholder="Enter title..."
                class="w-full p-2 mb-4 border bg-amber-100 border-gray-300 rounded"
            />
            <p class="text-lg text-white text-center font-medium mb-2">The Mood</p>
            <textarea
                bind:value={state.mood}
                placeholder="Write your mood..."
                class="w-full h-24 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4"
            ></textarea>
            <p class="text-lg text-white text-center font-medium mb-2">Description</p>
            <textarea
                bind:value={state.description}
                placeholder="Write your journal entry..."
                class="w-full h-48 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4"
            ></textarea>
            <div class="flex justify-center gap-4">
                <button
                    type="button"
                    onclick={handleSave}
                    disabled={state.isLoading}
                    class="px-8 py-2 bg-[#8B0000] text-white rounded hover:bg-red-800 disabled:opacity-50"
                >
                    {state.isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                    type="button"
                    onclick={closeModal}
                    class="px-8 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- View Journal Modal -->
{#if state.showViewModal && state.selectedJournal}
    <div class="fixed inset-0 flex items-center justify-center z-50">
        <button 
            type="button" 
            class="fixed inset-0 bg-black opacity-50 border-none cursor-pointer" 
            onclick={closeViewModal}
            aria-label="Close journal view"
        ></button>
        <div class="bg-[#1E1E1E] rounded-lg shadow-lg w-[600px] max-h-[80vh] p-8 overflow-y-auto relative z-10">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">{state.selectedJournal.title}</h2>
                <button 
                    type="button" 
                    onclick={closeViewModal}
                    class="text-gray-400 hover:text-white text-2xl font-bold"
                    aria-label="Close modal"
                >
                    ×
                </button>
            </div>
            
            <div class="mb-6">
                <h3 class="text-lg text-white font-medium mb-2">Mood</h3>
                <div class="bg-amber-100 p-4 rounded">
                    <p>{state.selectedJournal.mood}</p>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="text-lg text-white font-medium mb-2">Journal Entry</h3>
                <div class="bg-amber-100 p-4 rounded whitespace-pre-wrap">
                    <p>{state.selectedJournal.description}</p>
                </div>
            </div>
            
            <div class="text-gray-400 text-sm">
                <p>Created: {new Date(state.selectedJournal.createdAt).toLocaleString()}</p>
            </div>
            
            <div class="mt-6 flex justify-center gap-4">
                <button
                    type="button"
                    onclick={openEditModal}
                    class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Edit
                </button>
                <button
                    type="button"
                    onclick={handleDelete}
                    disabled={state.isDeleting}
                    class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {state.isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                    type="button"
                    onclick={closeViewModal}
                    class="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Edit Journal Modal -->
{#if state.showEditModal && state.selectedJournal}
    <div class="fixed inset-0 flex items-center justify-center z-50">
        <button 
            type="button" 
            class="fixed inset-0 bg-black opacity-50 border-none cursor-pointer" 
            onclick={closeEditModal}
            aria-label="Close journal edit"
        ></button>
        <div class="bg-[#1E1E1E] rounded-lg shadow-lg w-[600px] max-h-[80vh] p-8 overflow-y-auto relative z-10">
            <h2 class="text-2xl font-bold mb-4 text-white text-center">Edit Journal Entry</h2>
            
            {#if state.error}
                <div class="mb-4 p-3 bg-red-800 text-white rounded-md">
                    {state.error}
                </div>
            {/if}

            <input
                type="text"
                bind:value={state.title}
                placeholder="Enter title..."
                class="w-full p-2 mb-4 border bg-amber-100 border-gray-300 rounded"
            />
            <p class="text-lg text-white text-center font-medium mb-2">The Mood</p>
            <textarea
                bind:value={state.mood}
                placeholder="Write your mood..."
                class="w-full h-24 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4"
            ></textarea>
            <p class="text-lg text-white text-center font-medium mb-2">Description</p>
            <textarea
                bind:value={state.description}
                placeholder="Write your journal entry..."
                class="w-full h-48 p-2 bg-amber-100 border border-gray-300 rounded resize-none mb-4"
            ></textarea>
            <div class="flex justify-center gap-4">
                <button
                    type="button"
                    onclick={handleUpdate}
                    disabled={state.isLoading}
                    class="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {state.isLoading ? 'Updating...' : 'Update'}
                </button>
                <button
                    type="button"
                    onclick={closeEditModal}
                    class="px-8 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
{/if}