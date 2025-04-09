<script>
    import { onMount } from "svelte";
    import * as Card from "$lib/components/ui/card/index";
    import {Button} from "$lib/components/ui/button/index";
    import {Skeleton} from "$lib/components/ui/skeleton/index";
    import ShadEditorStandardiser from '$lib/components/shad-editor/shad-editor-standardiser-read.svelte';
    import {Plus, Edit, Trash, Blocks} from "lucide-svelte";
    let {id} = $props();
    import {sidebarState} from "./sidebar-state.svelte";

    let prose = $state()
    onMount(async () =>{
        console.log(id)
        const response = await fetch(`/api/prose?id=${id}`);
        let output = await response.json()
        prose = output.content
    })

    

</script>
<div class="flex flex-col">
    {#if prose}
        <ShadEditorStandardiser class="h-min" bind:content={prose} editable={false} showToolbar={false} />
    {:else}
        <p>Loading...</p>
    {/if}
</div>