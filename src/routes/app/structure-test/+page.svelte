<script lang="ts">
    import type { PageData } from './$types';
    import DocStructureTest from './doc-structure.svelte';
    import * as Card from "$lib/components/ui/card/index";
    import {Button} from '$lib/components/ui/button/index';
    import {Label} from '$lib/components/ui/label/index';
    import {Input} from '$lib/components/ui/input/index';
 
    import {ListPlus} from 'lucide-svelte'


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
        <div class="flex flex-col p-4">
            <DocStructureTest bind:structure={structure} document={structure}/>
        </div>
    {/if}
</div>
