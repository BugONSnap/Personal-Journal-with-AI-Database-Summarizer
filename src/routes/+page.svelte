<script>
  import { goto } from '$app/navigation';
  
  let isLoginForm = true;
  let email = '';
  let password = '';
  
  async function handleSubmit() {
    try {
      // TODO: Add actual authentication logic here
      // For now, we'll just simulate a successful login
      if (email && password) {
        // Redirect to journal page
        await goto('/Journalpage');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
</script>

<div class="min-h-screen w-full bg-red-900 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-2xl">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-4">Personal Journal</h1>
      <h2 class="text-2xl font-semibold text-gray-300">
        {isLoginForm ? 'Login Form' : 'Signup Form'}
      </h2>
    </div>
    <div class="mb-6">
      <div class="flex rounded-md overflow-hidden">
        <button 
          class="flex-1 py-2 px-4 {isLoginForm ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'} transition-colors duration-200"
          on:click={() => isLoginForm = true}
        >
          Login
        </button>
        <button 
          class="flex-1 py-2 px-4 {!isLoginForm ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'} transition-colors duration-200"
          on:click={() => isLoginForm = false}
        >
          Signup
        </button>
      </div>
    </div>
    {#if isLoginForm}
      <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email Address"
            required
            bind:value={email}
            class="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            required
            bind:value={password}
            class="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
          />
        </div>
       
        <button
          type="submit"
          class="w-full py-3 px-4 bg-red-700 hover:bg-red-600 text-white rounded-md font-medium transition-colors duration-200"
        >
          Login
        </button>
    
      </form>
    {:else}
      <form class="space-y-6" on:submit|preventDefault>
        <div>
          <input
            type="email"
            placeholder="Email Address"
            required
            class="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            required
            class="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            required
            class="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 px-4 bg-red-700 hover:bg-red-600 text-white rounded-md font-medium transition-colors duration-200"
        >
          Signup
        </button>
      </form>
    {/if}
  </div>
</div>


