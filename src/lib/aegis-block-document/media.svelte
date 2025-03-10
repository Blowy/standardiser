<script>
    import { onMount } from "svelte";
    import * as Table from "$lib/components/ui/table/index";
    import * as Card from "$lib/components/ui/card/index";
    import {Button} from "$lib/components/ui/button/index";
    import {Skeleton} from "$lib/components/ui/skeleton/index";
    import {Plus, Edit, Trash, Image} from "lucide-svelte";
    import {sidebarState} from "./sidebar-state.svelte";
    let {id} = $props();

    let med = $state()
    onMount(async () =>{
        console.log(id)
        const response = await fetch(`/api/media?id=${id}`);
        med = await response.json();
    })
    

</script>
<div class="flex flex-col">
    {#if med}
        <div class="flex flex-col items-center gap-4 grow-0 p-4 border rounded-md">
            <img src={med.url} alt={med.caption} class="w-auto"/>
            <p class="font-bold align-center">{med.caption}</p>
        </div>
    {:else}
        <p>Loading...</p>
    {/if}
</div>