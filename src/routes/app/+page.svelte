<script lang="ts">
	import CustomSelect from '$lib/components/custom-select.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import {enhance} from '$app/forms'
	import type { PageData } from '../$types';
	import type { ActionData } from './$types';
	let { data, form }: {data:PageData, form: ActionData} = $props();
	let value = $state('')
	let switch_value = $state(true)
	let values = [{value: '1', label: 'One'}, {value: '2', label: 'Two'}, {value: '3', label: 'Three'}]
</script>

<Switch bind:checked={switch_value}/>
{switch_value}
<form method="post" id="select-test">
	<CustomSelect bind:value={value} select_type="single" name="select_form" values={values} placeholder="placeholder text" bind:disabled={switch_value}></CustomSelect>
</form>
