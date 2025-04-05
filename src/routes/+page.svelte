<script>
  import { goto } from '$app/navigation';
  
  let isLoginForm = true;
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let isLoading = false;
  
  async function handleSubmit() {
    try {
      isLoading = true;
      error = '';
      
      if (!isLoginForm && password !== confirmPassword) {
        error = 'Passwords do not match';
        return;
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          action: isLoginForm ? 'login' : 'register'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to journal page
      await goto('/Journalpage');
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
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
    
    {#if error}
      <div class="mb-4 p-3 bg-red-800 text-white rounded-md">
        {error}
      </div>
    {/if}
    
    <div class="mb-6">
      <div class="flex rounded-md overflow-hidden">
        <button 
          class="flex-1 py-2 px-4 {isLoginForm ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'} transition-colors duration-200"
          on:click={() => {
            isLoginForm = true;
            error = '';
          }}
        >
          Login
        </button>
        <button 
          class="flex-1 py-2 px-4 {!isLoginForm ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'} transition-colors duration-200"
          on:click={() => {
            isLoginForm = false;
            error = '';
          }}
        >
          Signup
        </button>
      </div>
    </div>
    
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
      
      {#if !isLoginForm}
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            required
            bind:value={confirmPassword}
            class="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
          />
        </div>
      {/if}
      
      <button
        type="submit"
        disabled={isLoading}
        class="w-full py-3 px-4 bg-red-700 hover:bg-red-600 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : (isLoginForm ? 'Login' : 'Signup')}
      </button>
    </form>
  </div>
</div>


