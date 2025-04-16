<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  function handleLogout() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    goto('/');
  }
</script>

<header class="fixed top-0 left-0 right-0 bg-black text-white z-50">
  <nav class="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-2">
    <div class="flex justify-end items-center space-x-4">
      <a 
        href="/Journalpage"
        class="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
      >
        Write New
      </a>
      <a 
        href="/Summarize"
        class="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
      >
        Summarize Me
      </a>
      <button 
        on:click={handleLogout}
        class="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
      >
        Log out
      </button>
    </div>
  </nav>
</header>