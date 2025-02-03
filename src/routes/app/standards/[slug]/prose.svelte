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
        const response = await fetch(`/api/prose?id=${id}`);
        let output = await response.json()
        prose = output.content
    })

    

</script>
<div class="flex flex-col">
    {#if prose}
        <Card.Root class="rounded-none shadow-none">
            <Card.Header>
                <div class="flex flex-row justify-between items-center">
                    <div>
                        <Card.Description class="flex flex-row gap-2">
                            <Blocks class="size-4"/>
                            <span>Prose Block</span>
                        </Card.Description>
                    </div>
                    <!-- <div class="flex gap-2">
                        <Button variant="outline" size="icon" onclick={()=>{
                            sidebarState.setOpen(true)
                            sidebarState.setActiveItem(id)
                            sidebarState.setActiveItemType('prose')
                        }}>
                            <Edit></Edit>
                        </Button>
                        <Button variant="outline" size="icon"><Trash></Trash></Button>
                    </div> -->
                </div>
            </Card.Header>
            <Card.Content>
                <ShadEditorStandardiser class="h-min" bind:content={prose} editable={false} showToolbar={false} />
            </Card.Content>
        </Card.Root>         
    {:else}
        <p>Loading...</p>
    {/if}
</div>