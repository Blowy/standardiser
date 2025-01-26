<script lang="ts">
    import { onMount } from 'svelte';
    import {Button} from '$lib/components/ui/button/index';
    import DocStructure from "./doc-structure.svelte";
    import Requirement from './requirement.svelte';
    import Media from './media.svelte';
    import Prose from './prose.svelte';
    import * as Accordion from "$lib/components/ui/accordion/index";
    import {ListEnd, Trash,MoveUp,MoveDown} from "lucide-svelte"

    let {structure, level, edit} = $props();
    
</script>

{#each structure as item}
    {#if Object.hasOwn(item, 'title')}
        <Accordion.Item class={
            edit == true && level == 1 ?
                "mb-0 border border-green-500" :
                edit == true && level == 2 ? 
                    "mb-0 border border-blue-500" :
                    edit == true && level == 3 ? 
                        "mb-0 border border-orange-500" :
                        edit == true && level == 4 ? 
                            "mb-0 border border-purple-500" :
                            "mb-2 border"
                }
                value={item.block_id.toString()}
                >
            <Accordion.Trigger class= " p-4">
                {item.title}
            </Accordion.Trigger>
            <Accordion.Content class="p-4 border-t pb-0">
                {#if item.blocks.length>0}
                    <Accordion.Root type="multiple" class="pb-0">
                        <DocStructure structure={item.blocks} edit={edit} level={level+1}/>
                    </Accordion.Root>
                {/if}
            </Accordion.Content>
        </Accordion.Item>
        {#if edit}
            <div class="flex flex-row justify-center w-full -mt-4 mb-4">
                <Button class="rounded-r-none rounded-l-full" variant="outline">
                    <MoveUp class="size-2"/>
                </Button>
                <Button class="rounded-none border-l-0" variant="outline">
                    <MoveDown class="size-2"/>
                </Button>
                <Button class={level >= 4 ? "rounded-none border-l-0 opacity-100" : "rounded-none border-l-0"} variant="outline" disabled={level >= 4}>
                    <ListEnd class="size-2"/>
                </Button>
                <Button class="rounded-l-none rounded-r-full border-l-0" variant="outline">
                    <Trash class="size-2"/>
                </Button>
            </div>
        {/if}
    {:else}
        {#if item.type == "prose"}
            <Prose id={item.id}/>
        {:else if item.type == "media"}
            <Media id={item.id}/>
        {:else if item.type == "requirement"}
            <Requirement id={item.id}/>
        {/if}
    {/if}
{/each}