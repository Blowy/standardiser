<script lang="ts">
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import {enhance} from '$app/forms'
	import type { PageData } from '../$types';
	import type { ActionData } from './$types';
	let { data, form }: {data:PageData, form: ActionData} = $props();
	let value = $state('')
	let switch_value = $state(true)
	let values = [{value: '1', label: 'One'}, {value: '2', label: 'Two'}, {value: '3', label: 'Three'}]
</script>
