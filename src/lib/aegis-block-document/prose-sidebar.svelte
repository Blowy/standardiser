<script lang="ts">
	import ShadEditorStandardiser from '$lib/components/shad-editor/shad-editor-standardiser.svelte';
    import {Button} from '$lib/components/ui/button/index';
    import {Save} from "lucide-svelte";
    import {onMount} from 'svelte';

    let {id} = $props()
    let prose = $state()

    onMount(async () =>{
        const response = await fetch(`/api/prose?id=${id}`);
        const output = await response.json();
        console.log(output)
        prose = output.content
    })
    $inspect(prose)

</script>
<main class="flex flex-col gap-4 p-4">
    {#if prose}
	    <ShadEditorStandardiser editable={true} class="h-min" bind:content={prose}   />
        <Button>
            <Save/>
            <span>Save Changes</span>   
        </Button>
    {:else}
        <p>Loading...</p>
    {/if}
    
</main>