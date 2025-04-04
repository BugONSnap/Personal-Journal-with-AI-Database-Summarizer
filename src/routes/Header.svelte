<script>
  import { page } from '$app/stores';
</script>

<header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
  <nav class="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-4">
    <div class="flex justify-between items-center">
      <div class="flex-shrink-0">
        <a href="/" class="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200">
          <span>Mood Journal</span>
        </a>
      </div>

      <ul class="flex space-x-8 sm:space-x-4">
        <li>
          <a 
            href="/" 
            class="{$page.url.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'} hover:text-blue-600 font-medium transition-colors duration-200 pb-1">
            Home
          </a>
        </li>
        <li>
          <a 
            href="/journal" 
            class="{$page.url.pathname === '/journal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'} hover:text-blue-600 font-medium transition-colors duration-200 pb-1">
            Journal
          </a>
        </li>
        <li>
          <a 
            href="/summary" 
            class="{$page.url.pathname === '/summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'} hover:text-blue-600 font-medium transition-colors duration-200 pb-1">
            Summary
          </a>
        </li>
      </ul>
    </div>
  </nav>
</header>