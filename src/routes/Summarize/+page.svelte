<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../Header.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header />

<div class="bg-[#8B0000] min-h-screen">
    <div class="container mx-auto py-16">
        <div class="bg-white rounded-lg shadow-lg max-w-4xl mx-auto min-h-[600px] flex flex-col">
            <div class="text-center p-6 border-b">
                <h1 class="text-4xl font-bold">Personal Journal</h1>
                <h2 class="text-2xl font-medium">Summarizer</h2>
            </div>
            
            <div class="flex-1 flex flex-col justify-end">
                <!-- Empty space for AI summary content -->
            </div>
            
            <div class="p-4">
                <div class="bg-gray-900 rounded-full">
                    <input 
                        type="text" 
                        placeholder="Write Something....." 
                        class="w-full bg-transparent text-white py-3 px-4 rounded-full text-lg focus:outline-none"
                    />
                </div>
            </div>
        </div>
    </div>
</div>