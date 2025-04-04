<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../Header.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-16">
        <h1 class="text-3xl font-bold text-center text-white mb-8">Mood Journal</h1>
        <div class="flex justify-center">
            <div class="max-w-4xl w-full px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Write New Entry Card -->
                    <div class="bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                        <div class="rounded-full border-2 border-black w-16 h-16 flex items-center justify-center mb-4">
                            <span class="text-4xl">+</span>
                        </div>
                        <div class="text-center font-medium">Write Something......</div>
                    </div>

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