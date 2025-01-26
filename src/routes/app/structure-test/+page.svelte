<script lang="ts">
    import type { PageData } from './$types';
    import DocStructureTest from './doc-structure-test.svelte';
    import * as Card from "$lib/components/ui/card/index";
    import {Button} from '$lib/components/ui/button/index';
    import {Label} from '$lib/components/ui/label/index';
    import {Input} from '$lib/components/ui/input/index';
    import {ListPlus} from 'lucide-svelte'


    let { data }: { data: PageData } = $props();
    
    const structure:any[] = $state([])

    function createBlock(blockId:number, title:string|null, type:string|null =null){
        const block:{block_id:number, title?:string, type?:string, blocks?:[]} = {block_id:blockId}
        if(title){
            block.title = title
            block.blocks = []
        }
        if(type){
            block.type = type
        }
        return block
    }
    function addSection(structure:any, blockId:number, title:string){
        const newSection = createBlock(blockId, title)
        structure.push(newSection)
        return newSection
    }

    let section_title = $state('')


</script>
<div>
    {#if structure.length==0}
        <div class="p-4 w-1/3">
            <Card.Root>
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
                        <Input type="text" bind:value={section_title}/>
                        <Button onclick={()=>{addSection(structure, 1, section_title)}}>
                            <ListPlus></ListPlus>
                            <span>Add Section</span>
                        </Button>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    {:else}
        <DocStructureTest structure={structure}/>
    {/if}
</div>
