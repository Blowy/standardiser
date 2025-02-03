<script lang="ts">
    import type { PageData } from './$types';
    import DocStructureTest from './doc-structure-test.svelte';
    import * as Card from "$lib/components/ui/card/index";
    import {Button, buttonVariants} from '$lib/components/ui/button/index';
    import {Label} from '$lib/components/ui/label/index';
    import {Input} from '$lib/components/ui/input/index';
    import {Separator} from '$lib/components/ui/separator/index';
    import {ListPlus, CirclePlus, ListEnd, ListStart} from 'lucide-svelte'
    import * as Popover from '$lib/components/ui/popover/index';


    let { data }: { data: PageData } = $props();
    
    let structure:any[] = $state([])
    
    $inspect(structure)

    function createBlock(blockId:number, title:string|null, type:string|null =null){
        const block:{block_id:number, title?:string, type?:string, blocks?:[], add_above_open:boolean, edit_title?:boolean} = {block_id:blockId, add_above_open:false}
        if(title){
            block.title = title
            block.blocks = []
            block.edit_title = false
        }
        if(type){
            block.type = type
        }
        return block
    }
    function addSectionToEnd(structure:any, blockId:number, title:string){
        const newSection = createBlock(blockId, title)
        structure.push(newSection)
        return newSection
    }
    function addSectionToStart(structure:any, blockId:number, title:string){
        const newSection = createBlock(blockId, title)
        structure.unshift(newSection)
        return newSection
    }

    let section_title = $state('')
    let above_section_open = $state(false)
    let above_section_open_binding = $state(false)
    let below_section_open = $state(false)
    let below_section_open_binding = $state(false)



</script>
<div>
    {#if structure.length==0}
        <div class="p-4">
            <Card.Root class="rounded-none">
                <Card.Header>
                    <Card.Title>
                        Welcome to your new Standard
                    </Card.Title>
                    <Card.Description>
                        Create a new section to get started
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="w-full flex flex-col gap-4">
                        <Label>
                            Section Title
                        </Label>
                        <Input type="text" bind:value={section_title} placeholder="Enter a Section Title"/>
                        <Button onclick={()=>{
                            addSectionToEnd(structure, 1, section_title)
                            section_title = ''
                        }}>
                            <ListPlus></ListPlus>
                            <span>Add Section</span>
                        </Button>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    {:else}
        <!-- <div class="w-full flex flex-row justify-center mt-2">
            <Popover.Root bind:open={above_section_open_binding} onOpenChange={()=>{above_section_open = !above_section_open}}>
                <Popover.Trigger class="w-full px-4">
                    <div class="relative group w-full ">
                        <div class={above_section_open == true ? "opacity-100 flex flex-col absolute inset-x-0 top-1 items-center w-full" : "opacity-0 group-hover:opacity-100 flex flex-col absolute inset-x-0 top-1 items-center w-full"}>

                            <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-blue-500">
                                <CirclePlus/>
                            </Button>
                            <Separator class="border-blue-500 border-2 absolute top-4 z-0"/>
                        </div>
                        <div class={above_section_open == true ? "h-11" : "h2 group-hover:h-11"}></div>
                    </div>
                </Popover.Trigger>
                <Popover.Content class="w-80">
                    <div class="flex flex-row gap-2">
                        <Input type="text" placeholder="Section Title" bind:value={section_title}/>
                        <Button variant="default" size="icon" onclick={()=>{
                            addSectionToStart(structure, 1, section_title)
                            section_title = ''
                            above_section_open_binding = false
                            above_section_open = false
                        }}>
                            <ListStart/>
                            <span class="sr-only">Add Section</span>
                        </Button>
                    </div>
                </Popover.Content>
            </Popover.Root>
        </div> -->
        <div class="flex flex-col p-4">
            <DocStructureTest bind:structure={structure} editable={false}/>
        </div>
        <!-- <div class="w-full flex flex-row justify-center mt-2">
            <Popover.Root bind:open={below_section_open_binding} onOpenChange={()=>{below_section_open = !below_section_open}}>
                <Popover.Trigger class="w-full px-4">
                    <div class="relative group w-full ">
                        <div class={below_section_open == true ? "opacity-100 flex flex-col absolute inset-x-0 -top-1 items-center w-full" : "opacity-0 group-hover:opacity-100 flex flex-col absolute inset-x-0 -top-1 items-center w-full"}>

                            <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-blue-500">
                                <CirclePlus/>
                            </Button>
                            <Separator class="border-blue-500 border-2 absolute top-4 z-0"/>
                        </div>
                        <div class={below_section_open == true ? "h-11" : "h2 group-hover:h-11"}></div>
                    </div>
                </Popover.Trigger>
                <Popover.Content class="w-80">
                    <div class="flex flex-row gap-2">
                        <Input type="text" placeholder="Section Title" bind:value={section_title}/>
                        <Button variant="default" size="icon" onclick={()=>{
                            addSectionToEnd(structure, 1, section_title)
                            section_title = ''
                            below_section_open_binding = false
                            below_section_open = false
                        }}>
                            <ListEnd/>
                            <span class="sr-only">Add Section</span>
                        </Button>
                    </div>
                </Popover.Content>
            </Popover.Root>
        </div> -->
    {/if}
</div>
