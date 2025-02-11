<script lang="ts">
    import DocStructure from './doc-structure.svelte'
    import * as Accordion from "$lib/components/ui/accordion/index";
	import {Button, buttonVariants} from '$lib/components/ui/button/index';
    import {Input} from '$lib/components/ui/input/index';
    import * as Popover from '$lib/components/ui/popover/index';
    import { invalidate } from '$app/navigation';
    import {ListPlus, Trash, Move, MoveUp, MoveDown, Plus, Edit, Ellipsis, Pilcrow, ListChecks, Image, ListStart, ListEnd, CirclePlus, Save} from 'lucide-svelte'
    import {Separator} from '$lib/components/ui/separator/index';

    import Requirement from './requirement.svelte';
    import Prose from './prose.svelte';
    import Media from './media.svelte';
    let {structure=$bindable(), document=$bindable(), standard_id} = $props()

    $effect(()=>{
        reassignBlockIds(structure)  
    })
    
    let below_section_open = $state(false)
    let below_section_open_binding = $state(false)

    let section_title = $state('')
    let value=$state('')
    let input_value = $state('')
    let highestBlockId:number=$derived.by(()=>{
        console.log("Highest Block ID updated")
        return findHighestBlockId(structure)
    })

    function createBlock(blockId: number, title: string | null, type: string | null = null) {

        const block: { block_id: number, id?:number|null, add_above_open: boolean, title?: string, type?: string, blocks?: any[], edit_title?: boolean } = { block_id: blockId, add_above_open: false, id:null};
        if (title) {
            block.title = title;
            block.blocks = [];
            block.edit_title = false;
        }
        if (type) {
            block.type = type;
        }
        return block;
    }

    async function addBlockAtIndex(structure: any, blockId: number, title: string | null = null, type: string | null = null, index:number, position:'before'|'after') {
        const newBlock = createBlock(blockId, title, type);
        if (position === 'before') {
            await structure.splice(index, 0, newBlock);
        } else if (position === 'after') {
            await structure.splice(index + 1, 0, newBlock);
        }
        if(newBlock.type == "requirement"){
            newBlock.id = await fetch(`/api/requirements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    blockId : newBlock.block_id,
                    clientId: 'Client ID Not yet set',
                    requirementText: 'New Requirement',
                    rationaleText: 'New Rationale',
                    guidanceText: 'New Guidance',
                    standardId: standard_id,
                    content: JSON.stringify(document)
                })
            }).then(res => res.json()).then(data => data.id)
        }
        if(newBlock.type == "prose"){
            newBlock.id = await fetch(`/api/prose`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    blockId : newBlock.block_id,
                    clientId: 'Client ID Not yet set',
                    proseText: {},
                    standardId: standard_id,
                    content: JSON.stringify(document)
                })
            }).then(res => res.json()).then(data => data.id)
        }
        return newBlock;
    }

    function findBlockById(blocks: any[], blockId: number) {
        for (const block of blocks) {
            if (block.block_id === blockId) {
                return block;
            }
            if (block.blocks) {
                const foundBlock:any = findBlockById(block.blocks, blockId);
                if (foundBlock) {
                    return foundBlock;
                }
            }
        }
        return null;
    }

    function deleteBlock(structure: any[], blockIdToDelete: number) {
        let blockDeleted = false;

        function removeBlock(blocks: any[]) {
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];

                if (block.block_id === blockIdToDelete) {
                    blocks.splice(i, 1);
                    blockDeleted = true;
                    return;
                }

                if (block.blocks && block.blocks.length > 0) {
                    removeBlock(block.blocks);
                    if (blockDeleted) return;
                }
            }
        }

        removeBlock(structure);

        if (!blockDeleted) {
            throw new Error(`Block with ID ${blockIdToDelete} not found.`);
        }

        return structure;
    }

    function reassignBlockIds(structure: any[]) {
        let currentId = 1;

        function assignIds(blocks: any[]) {
            for (const block of blocks) {
                block.block_id = currentId++;
                if (block.blocks && block.blocks.length > 0) {
                    assignIds(block.blocks);
                }
            }
        }

        assignIds(structure);
        return structure;
    }

    function findHighestBlockId(structure: any[]) {
        let highestId = 1;

        function findMaxId(blocks: any[]) {
            for (const block of blocks) {
                if (block.block_id > highestId) {
                    highestId = block.block_id;
                }
                if (block.blocks && block.blocks.length > 0) {
                    findMaxId(block.blocks);
                }
            }
        }

        findMaxId(structure);
        return highestId;
    }

    function moveBlock(structure: any[], blockId: number, direction: 'up' | 'down') {
        function findAndMove(blocks: any[], parent: any[] | null = null) {
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];

                if (block.block_id === blockId) {
                    if (direction === 'up' && i > 0) {
                        [blocks[i - 1], blocks[i]] = [blocks[i], blocks[i - 1]];
                    } else if (direction === 'down' && i < blocks.length - 1) {
                        [blocks[i + 1], blocks[i]] = [blocks[i], blocks[i + 1]];
                    }
                    return true;
                }

                if (block.blocks && block.blocks.length > 0) {
                    if (findAndMove(block.blocks, blocks)) {
                        return true;
                    }
                }
            }
            return false;
        }
        findAndMove(structure);
    }
</script>
<div class="flex flex-col ">
    {#each structure as block, i}
    <div class="w-full flex flex-row justify-center ">
        <Popover.Root bind:open={block.add_above_open}>
            <Popover.Trigger class="w-full">
                <div class="relative group/add-above w-full mb-2 mt-1">
                    <div class={block.add_above_open == true ? "opacity-100 flex flex-col absolute inset-x-0 top-1 items-center w-full transition-opacity duration-300" : "opacity-0 group-hover/add-above:opacity-100 flex flex-col absolute inset-x-0 top-1 items-center w-full transition-opacity duration-300"}>
                        <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-blue-500">
                            <CirclePlus/>
                        </Button>
                        <Separator class="border-blue-500 border-2 absolute top-4 z-0"/>
                    </div>
                    <div class={block.add_above_open == true ? "h-11" : "h-4 group-hover/add-above:h-11"}></div>
                </div>
            </Popover.Trigger>
            <Popover.Content class="w-80 flex flex-col gap-4" sideOffset={-7}>
                <div class="flex flex-row gap-2">
                    <Input type="text" placeholder="Section Title" bind:value={section_title}/>
                    <Button variant="default" size="icon" onclick={()=>{
                        addBlockAtIndex(structure, highestBlockId, section_title, null, i, 'before')
                        section_title = ''
                        block.add_above_open = false
                    }}>
                        <ListStart/>
                        <span class="sr-only">Add Section</span>
                    </Button>
                </div>
                <Separator></Separator>
                <div class="flex flex-col gap-2">
                    <Button onclick={()=>{
                        addBlockAtIndex(structure,highestBlockId,null,"requirement",i,"before")
                        section_title = ''
                        block.add_above_open = false
                        invalidate('app/standards/'+{standard_id})
                    }}>
                        <ListChecks/>
                        <span>Requirement</span>
                    </Button>
                    <Button onclick={()=>{
                        addBlockAtIndex(structure,highestBlockId,null,"prose",i,"before")
                        section_title = ''
                        block.add_above_open = false
                        }}>
                        <Pilcrow/>
                        <span>Prose</span>
                    </Button>
                    <Button onclick={()=>{addBlockAtIndex(structure,highestBlockId,null,"media",i,"before")}}>
                        <Image/>
                        <span>Media</span>
                    </Button>
                </div>
            </Popover.Content>
        </Popover.Root>
    </div>
        {#if Object.hasOwn(block, 'title')}
            <div class="relative group/edit-bar w-full">
                <div class="absolute top-3 right-14 opacity-0 group-hover/edit-bar:opacity-100 transition-opacity duration-300">
                    <div class="flex flex-row ">
                        <Button variant="outline" size="icon" class="rounded-r-none border-r-0" disabled={i === 0} onclick={()=>{moveBlock(structure, block.block_id, 'up')}}>
                            <MoveUp></MoveUp>
                        </Button>
                        <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{
                            console.log('title edit initiated')
                            block.edit_title = !block.edit_title
                        }}>
                            <Edit></Edit>
                        </Button>
                        <Button variant="outline" size="icon" class="border-r-0 rounded-none" disabled={block.blocks.length > 0} onclick={()=>{deleteBlock(structure, block.block_id)}}>
                            <Trash></Trash>
                        </Button>
                        <Button variant="outline" size="icon" class="rounded-l-none" disabled={i === structure.length - 1} onclick={()=>{moveBlock(structure, block.block_id, 'down')}}>
                            <MoveDown></MoveDown>
                        </Button>
                    </div>
                </div>
                {#if block.edit_title == true}
                    <div class="absolute top-4 left-4 flex flex-row w-1/2">
                        <Input type="text" bind:value={block.title} class="rounded-r-none border-r-0 w-full"/>
                        <Button variant="default" size="icon" class="rounded-l-none" onclick={()=>{block.edit_title = false}}>
                            <Save></Save>
                        </Button>
                    </div>
                {/if}
                <Accordion.Root type="multiple">
                    <Accordion.Item class="border">
                        <Accordion.Trigger class="border-b px-4">
                            {#if block.edit_title==false}
                                <h1 class="font-semibold text-lg">{block.title}</h1>
                            {:else}
                                <p class="text-lg py-4"> </p>
                            {/if}
                        </Accordion.Trigger>
                        <Accordion.Content class="px-4 pb-0">
                            {#if block.blocks.length>0}
                                <DocStructure structure={block.blocks} document={structure} standard_id={standard_id}/>
                            {:else}
                                <p class="font-semibold text-muted-foreground pt-4">This section is empty, how would you like to populate it?</p>
                                <div class="flex flex-row gap-4 py-4 w-1/2">
                                    <Popover.Root>
                                        <Popover.Trigger class={buttonVariants({variant: 'outline'})+"w-1/4"}>
                                            <Plus/>
                                            Add Child Section
                                        </Popover.Trigger>
                                        <Popover.Content class="w-80">
                                            <div class="flex flex-row gap-2">
                                                <Input type="text" placeholder="Section Title" bind:value={section_title}/>
                                                <Button variant="default" size="icon" onclick={()=>{
                                                        addBlockAtIndex(block.blocks, highestBlockId+1, section_title, null, block.blocks.length-1, 'after')
                                                        section_title = ''
                                                    }}>
                                                    <ListEnd/>
                                                    <span class="sr-only">Add Section</span>
                                                </Button>
                                            </div>
                                        </Popover.Content>
                                    </Popover.Root>
                                    <Separator orientation="vertical"></Separator>
                                    <div class="w-full flex flex-row gap-4">
                                        <Button variant="outline" class="w-1/3" onclick={()=>{addBlockAtIndex(block.blocks,highestBlockId+1,null,"requirement",block.blocks.length-1,"after")}}>
                                            <ListChecks></ListChecks>
                                            <span>Add Requirement</span>
                                        </Button>
                                        <Button variant="outline" class="w-1/3" onclick={()=>{addBlockAtIndex(block.blocks,highestBlockId+1,null,"prose",block.blocks.length-1,"after")}}>
                                            <Pilcrow></Pilcrow>
                                            <span>Add Prose</span>
                                        </Button>
                                        <Button variant="outline" class="w-1/3" onclick={()=>{addBlockAtIndex(block.blocks,highestBlockId+1,null,"media",block.blocks.length-1,"after")}}>
                                            <Image></Image>
                                            <span>Add Media</span>
                                        </Button>    
                                    </div>
                                </div>
                            {/if}
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>
        {:else}
        <div class="relative group/edit-bar-block w-full">
            <div class="absolute top-4 right-4 opacity-0 group-hover/edit-bar-block:opacity-100 transition-opacity duration-300">
                <div class="flex flex-row ">
                    <Button variant="outline" size="icon" disabled={i === 0} class="rounded-r-none border-r-0" onclick={()=>{moveBlock(structure, block.block_id, 'up')}}>
                        <MoveUp></MoveUp>
                    </Button>
                    <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{console.log('block edit initiated')}}>
                        <Edit></Edit>
                    </Button>
                    <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{deleteBlock(structure, block.block_id)}}>
                        <Trash></Trash>
                    </Button>
                    <Button variant="outline" size="icon" disabled={i === structure.length-1} class="rounded-l-none" onclick={()=>{moveBlock(structure, block.block_id, 'down')}}>
                        <MoveDown></MoveDown>
                    </Button>
                </div>
            </div>
            {#if block.type == "requirement"}
                <Requirement id={block.id}/>
            {:else if block.type== "prose"}
                <Prose id={block.id}/>
            {:else if block.type== "media"}
                <Media id={block.id}/>
            {/if}
        </div>      
        {/if}
    {/each}
</div>
<div class="w-full flex flex-row justify-center m-0 ">
    <Popover.Root bind:open={below_section_open_binding} onOpenChange={()=>{below_section_open = !below_section_open}}>
        <Popover.Trigger class="w-full">
            <div class="relative group/add-below w-full mt-2 pb-0 mb-0">
                <div class={below_section_open == true ? "opacity-100 flex flex-col absolute inset-x-0 items-center w-full transition-opacity duration-300" : "opacity-0 group-hover/add-below:opacity-100 flex flex-col absolute inset-x-0 items-center w-full transition-opacity duration-300"}>
                    <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-blue-500">
                        <CirclePlus/>
                    </Button>
                    <Separator class="border-blue-500 border-2 absolute top-4 z-0"/>
                </div>
                <div class={below_section_open == true ? "h-9" : "h2 group-hover/add-below:h-9"}></div>
            </div>
        </Popover.Trigger>
        <Popover.Content class="w-80 flex flex-col gap-4">
            <div class="flex flex-row gap-2">
                <Input type="text" placeholder="Section Title" bind:value={section_title}/>
                <Button variant="default" size="icon" onclick={()=>{
                    addBlockAtIndex(structure, highestBlockId, section_title, null, structure.length-1, 'after')
                    section_title = ''
                    below_section_open_binding = false
                    below_section_open = false
                }}>
                    <ListStart/>
                    <span class="sr-only">Add Section</span>
                </Button>
            </div>
            <Separator></Separator>
            <div class="flex flex-col gap-2">
                <Button onclick={()=>{
                    addBlockAtIndex(structure,highestBlockId,null,"requirement",structure.length-1,"after")
                    section_title = ''
                    below_section_open_binding = false
                    below_section_open = false
                }}>
                    <ListChecks/>
                    <span>Requirement</span>
                </Button>
                <Button onclick={()=>{
                        addBlockAtIndex(structure,highestBlockId,null,"prose",structure.length-1,"after")
                        below_section_open_binding = false
                        below_section_open = false
                    }}>
                    <Pilcrow/>
                    <span>Prose</span>
                </Button>
                <Button onclick={()=>{
                        addBlockAtIndex(structure,highestBlockId,null,"media",structure.length-1,"after")
                        below_section_open_binding = false
                        below_section_open = false
                    }}>
                    <Image/>
                    <span>Media</span>
                </Button>
            </div>
        </Popover.Content>
    </Popover.Root>
</div>

<!--TODO: Adding a block adds to the database-->
<!--TODO: Deleting a block removes from the database-->
<!--TODO: Editing the structure updates the database-->
<!--TODO: Modal for deletion of a block-->
<!--TODO: Advanced Move - Excel style before/after etc.-->