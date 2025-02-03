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
        const response = await fetch(`/api/media?id=${id}`);
        med = await response.json();
    })
    

</script>
<div class="flex flex-col">
    {#if med}
        <Card.Root class="rounded-none shadow-none">
            <Card.Header>
                <div class="flex flex-row justify-between items-center">
                    <div class="flex flex-col gap-2">
                        <Card.Description>
                            <Card.Description class="flex flex-row gap-2 items-center">
                                <Image class="size-4"/>
                                <span>Image Block</span>
                            </Card.Description>
                        </Card.Description>
                    </div>
                    <!-- <div class="flex gap-2">
                        <Button variant="outline" size="icon" onclick={()=>{
                            sidebarState.setOpen(true)
                            sidebarState.setActiveItem(id)
                            sidebarState.setActiveItemType('media')
                        }}>
                            <Edit></Edit>
                        </Button>
                        <Button variant="outline" size="icon"><Trash></Trash></Button>
                    </div> -->
                </div>
            </Card.Header>
            <Card.Content class="flex flex-col items-center grow-0">
                <div class="flex flex-col items-center gap-4 grow-0 p-4 border rounded-md">
                    <img src={med.url} alt={med.caption} class="w-auto"/>
                    <p class="font-bold align-center">{med.caption}</p>
                </div>
            </Card.Content>
        </Card.Root>         
    {:else}
        <p>Loading...</p>
    {/if}
</div>