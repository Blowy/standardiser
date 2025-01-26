<script lang="ts">
    import DocStructureTest from './doc-structure-test.svelte'
    import * as Card from "$lib/components/ui/card/index";
	import {Button} from '$lib/components/ui/button/index';
    import {Label} from '$lib/components/ui/label/index';
    import {Input} from '$lib/components/ui/input/index';
    import CustomSelect from '$lib/components/custom-select.svelte';
    import {ListPlus} from 'lucide-svelte'
    import {onMount} from 'svelte'
    let {structure=$bindable()} = $props()
    
    $inspect(structure)

    const block_types = [
        {value: 'requirement', label: 'Requirement'},
        {value: 'prose', label: 'Prose'},
        {value: 'media', label: 'Media'},
    ]

    let section_title = $state('')
    let value=$state('')


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
    function addBlock(parentBlock:any, blockId:number, title:string|null=null, type:string|null=null){
        const newBlock = createBlock(blockId, title, type)
        parentBlock.blocks.push(newBlock)
        return newBlock
    }
    function findBlockById(blocks:any, blockId:number){
        for(const block of blocks){
            if(block.block_id === blockId){
                return block
            }
            if(block.blocks){
                const foundBlock:any = findBlockById(block.blocks, blockId)
                if(foundBlock){
                    return foundBlock
                }
            }
        }
        return null
    }
    function editBlockTitle(blockId:number, newTitle:string){
        const block = findBlockById(structure, blockId)
        if(block){
            block.title = newTitle
        }
    }
    function editBlockType(blockId:number, newType:string){
        const block = findBlockById(structure, blockId)
        if(block){
            block.type = newType
        }
    }
    function deleteBlock(blockId:number){
        const block = findBlockById(structure, blockId)
        if(block){
            const parentBlock = findBlockById(structure, blockId)
            if(parentBlock){
                parentBlock.blocks = parentBlock.blocks.filter((b:any)=>b.block_id !== blockId)
            }else{
                structure = structure.filter((b:any)=>b.block_id !== blockId)
            }
        }
    }
    function moveBlock(blockId:number, newParentBlockId:number){
        const block = findBlockById(structure, blockId)
        if(block){
            const parentBlock = findBlockById(structure, newParentBlockId)
            if(parentBlock){
                parentBlock.blocks.push(block)
                const oldParentBlock = findBlockById(structure, blockId)
                if(oldParentBlock){
                    oldParentBlock.blocks = oldParentBlock.blocks.filter((b:any)=>b.block_id !== blockId)
                }else{
                    structure = structure.filter((b:any)=>b.block_id !== blockId)
                }
            }
        }
    }
    function reassignBlockIds(structure:any) {
        let currentId = 1; 

        function assignIds(blocks:any) {
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

</script>
<div>
    {#each structure as block}
            {#if Object.hasOwn(block, 'title')}
                <Card.Root>
                    <Card.Header>
                        <Card.Title>{block.title}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {#if block.blocks}
                            <DocStructureTest structure={block.blocks}/>
                        {/if}
                    </Card.Content>
                </Card.Root>
            {:else}
                <Card.Root>
                    <Card.Header>
                        <Card.Title>
                            {block.type}
                        </Card.Title>
                        <Card.Content>
                            <form>
                                <Label for="block-type-select">
                                    Select a Block Type
                                </Label>
                                <CustomSelect name="block-type-select" select_type="single" values={block_types} bind:select_value={value} placeholder="Select a Block Type" disabled={false}/>
                            </form>
                        </Card.Content>
                    </Card.Header>
                </Card.Root>
            {/if}
    {/each}
</div>
