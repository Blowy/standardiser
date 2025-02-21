<script>
    import { onMount } from "svelte";
    import * as Table from "$lib/components/ui/table/index";
    import * as Card from "$lib/components/ui/card/index";
    import {Button} from "$lib/components/ui/button/index";
    import {Skeleton} from "$lib/components/ui/skeleton/index";
    import * as Accordion from "$lib/components/ui/accordion/index";
    import {Plus, Edit, Trash, Blocks} from "lucide-svelte";
    import {sidebarState} from "./sidebar-state.svelte";
    
    

    let {id} = $props();

    let req = $state()
    onMount(async () =>{
        const response = await fetch(`/api/requirements?id=${id}`);
        req = await response.json();
    })
    
</script>
<div class="flex flex-col">
    {#if req}
        <Card.Root class="rounded-none shadow-none">
            <Card.Header>
                <div class="flex flex-row justify-between items-center">
                    <div class="flex flex-col gap-2">
                        <Card.Description>
                            <Card.Description class="flex flex-row gap-2">
                                <Blocks class="size-4"/>
                                <span>Requirement Block</span>
                            </Card.Description>
                        </Card.Description>
                    </div>
                    <!-- <div class="flex gap-2">
                        <Button variant="outline" size="icon" onclick={()=>{
                            sidebarState.setOpen(true)
                            sidebarState.setActiveItem(id)
                            sidebarState.setActiveItemType('requirement')
                        }}>
                            <Edit></Edit>
                        </Button>
                        <Button variant="outline" size="icon"><Trash></Trash></Button>
                    </div> -->
                </div>
            </Card.Header>
            <Card.Content>
                <div class="flex flex-col justify-start items-start gap-2 mb-8">
                    <span class="text-muted-foreground text-sm font-bold">{req.clientId}</span>
                    <span class="font-semibold text-lg">{req.requirementText}</span>
                </div>
                <div class="rounded-lg border">
                    <Table.Root class="">
                        <Table.Row>
                            <Table.Cell class="font-bold w-1/6">Rationale</Table.Cell>
                            <Table.Cell>{req.rationaleText}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell class="font-bold w-1/6">Guidance</Table.Cell>
                            <Table.Cell>{req.guidanceText}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell class="font-bold w-1/6">Verification</Table.Cell>
                            <Table.Cell>{req.verificationMethod}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell class="font-bold w-1/6">Legacy</Table.Cell>
                            <Table.Cell>{req.legacy === true ? "Yes" : "No"}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell class="font-bold">Internal Interfaces</Table.Cell>
                            <Table.Cell>{req.internalInterfaces.join(', ')}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell class="font-bold">External Interfaces</Table.Cell>
                            <Table.Cell>{req.externalInterfaces.join(', ')}</Table.Cell>
                        </Table.Row>
                    </Table.Root>
                </div>
            </Card.Content>
        </Card.Root>         
    {:else}
        <p>Loading...</p>
    {/if}
</div>