<script lang="ts">
    let {structure} = $props()
    import DocumentStructure from "./document-structure.svelte"
    import * as Accordion from "$lib/components/ui/accordion/index"
    import * as Card from "$lib/components/ui/card/index";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import * as Popover from "$lib/components/ui/popover/index"
    import {Button} from "$lib/components/ui/button/index"
    import {Separator} from "$lib/components/ui/separator/index"
    import {Input} from "$lib/components/ui/input/index"
    import {Lock, LockOpen, Edit, MoveUp, Trash, MoveDown, Pilcrow, CirclePlus, ListStart, Image, ListChecks, } from "lucide-svelte"
    import type {Element} from "./document-class"
    
    type StructureMapObject = {
        addAboveOpen: boolean
    }
    
    let structureMap=$state<StructureMapObject[]>(structure.map(() => {
        return {
            addAboveOpen: false,
        }
    }))
    let accordionOpenArray = $state<string[]>([])
    accordionOpenArray = structure.map((element:Element) => {
        if (element && Object.hasOwn(element, 'title')) {
            return `section-${element.block_id}`
        }
    })
    console.log(structure)
    $inspect(structureMap)
</script>
<div class="flex flex-col">
    {#each structure as element, i}
        <div class="w-full flex flex-row justify-center ">
            <div class="relative group/add-above w-full mt-2">
                <div class={structureMap[i].addAboveOpen == true ? "opacity-100 absolute items-center w-full": "opacity-0 group-hover/add-above:opacity-100 absolute items-center w-full transition-opacity duration-300"}>
                    <Popover.Root bind:open={structureMap[i].addAboveOpen}>
                        <Popover.Trigger class="w-full" >
                            {#snippet child({props})}
                                <div {...props} class="flex flex-col items-center w-full">
                                    <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-blue-500" >
                                        <CirclePlus/>
                                    </Button>
                                    <Separator class="border-blue-500 border-2 absolute top-4 z-0 w-full"/>
                                </div>
                            {/snippet}
                        </Popover.Trigger>
                        <Popover.Content class="w-full">
                            <div class="flex flex-col gap-2">
                                <Input placeholder="Add Section" class="w-full"/>
                                <Button variant="default" class="w-full">Add Section</Button>
                            </div>
                        </Popover.Content>
                    </Popover.Root>
                </div>
                <div class={structureMap[i].addAboveOpen == true ? "transition-height delay-75 duration-300 h-11" :"transition-height delay-75 duration-300  h-4 group-hover/add-above:h-11"}></div>
            </div>
        </div>
        {#if Object.hasOwn(element, 'title')}
            <Accordion.Root type="multiple" class="border border-1" bind:value={accordionOpenArray}>
                <Accordion.Item value={`section-${element.block_id}`}>
                    <div class="group/edit-bar relative w-full">
                        <div class="absolute top-3 right-14 transition-opacity duration-300 opacity-0 group-hover/edit-bar:opacity-100">
                            <div class="flex flex-row ">
                                <Button variant="outline" size="icon" class="rounded-r-none border-r-0" disabled={i === 0}>
                                    <MoveUp/>
                                </Button>
                                <Button variant="outline" size="icon" class="border-r-0 rounded-none">
                                    <Edit/>
                                </Button>
                                <Button variant="outline" size="icon" class="border-r-0 rounded-none" disabled={element.blocks.length > 0}>
                                    <Trash/>
                                </Button>
                                <Button variant="outline" size="icon" class="rounded-l-none" disabled={i === structure.length - 1}>
                                    <MoveDown/>
                                </Button>
                            </div>
                        </div>
                        <Accordion.Trigger class="p-4 bg-muted border-b">
                            <div class="flex flex-col gap-2 justify-start items-start">
                                <p class="text-lg">{element.title}</p>
                                <!-- <p class="text-md text-muted-foreground">{element.block_id}</p> -->
                            </div>    
                        </Accordion.Trigger>
                    </div>
                    <Accordion.Content class="px-4 pt-2 pb-2">
                        {#if element.blocks.length>0}
                            <DocumentStructure structure={element.blocks}/>
                        {:else}
                            <p>Empty Section</p>
                        {/if}   
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        {:else}
            <Card.Root>
                <Card.Header>
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex flex-col gap-2">
                            <Card.Title>
                                {element.type}
                            </Card.Title>
                            <Card.Description>
                                {element.block_id}
                            </Card.Description>
                        </div>
                        {#if element.locked.state == true}
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <Lock class="text-red-500 size-4"/>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Locked for editing by {element.locked.user}</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </Tooltip.Provider>
                        {/if}
                    </div>
                </Card.Header>
                <Card.Content>
                    {element.db_id}
                </Card.Content>
            </Card.Root>
        {/if}
    {/each}
    <div class="w-full flex flex-row justify-center mt-0 pt-2">
        <div class="relative group/add-above w-full">
            <div class={"opacity-0 group-hover/add-above:opacity-100 absolute items-center w-full transition-opacity delay-75 duration-300"}>
                <Popover.Root>
                    <Popover.Trigger class="w-full">
                        {#snippet child({props})}
                                <div {...props} class="flex flex-col items-center w-full">
                                    <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-blue-500">
                                        <CirclePlus/>
                                    </Button>
                                    <Separator class="border-blue-500 border-2 absolute top-4 z-0 w-full"/>
                                </div>
                            {/snippet}
                    </Popover.Trigger>
                </Popover.Root>
            </div>
            <div class={"transition-height delay-75 duration-300  h-2 group-hover/add-above:h-4"}></div>
        </div>
    </div>
</div>