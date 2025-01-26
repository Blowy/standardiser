<script lang="ts">
	import { page } from '$app/state';
	import * as Alert from '$lib/components/ui/alert/index';
	import { ShieldAlert } from 'lucide-svelte';
</script>

<div class="flex items-center justify-center mt-20 px-20">
	<Alert.Root variant="destructive">
		<ShieldAlert class="size-4" />
		<Alert.Title>Sorry, there has been a problem!</Alert.Title>
		<Alert.Description>
			An error occurred while processing your request. Please try again.
			<br />
			<br />
			<p class="font-bold text-destructive">{page.status}: {page.error?.message}</p>
		</Alert.Description>
	</Alert.Root>
</div>
