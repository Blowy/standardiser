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
        console.log(id)
        const response = await fetch(`/api/requirements?id=${id}`);
        req = await response.json();
    })
    
</script>
{#if req}
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
                <Table.Cell>
                    {#if req.internalInterfaces}
                        {req.internalInterfaces.join(', ')}
                    {:else}
                        None
                    {/if}
                </Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell class="font-bold">External Interfaces</Table.Cell>
                <Table.Cell>
                    {#if req.externalInterfaces}
                        {req.externalInterfaces.join(', ')}
                    {:else}
                        None
                    {/if}
                </Table.Cell>
            </Table.Row>
        </Table.Root>
    </div>
{:else}
    <p>Loading...</p>
{/if}