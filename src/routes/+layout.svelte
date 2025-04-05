<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	$effect(() => {
		const user = localStorage.getItem('user');
		const protectedRoutes = ['/Journalpage', '/summary'];
		
		if (protectedRoutes.includes($page.url.pathname) && !user) {
			goto('/');
		}
	});
</script>

<slot />
