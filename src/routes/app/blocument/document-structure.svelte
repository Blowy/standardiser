<script lang="ts">
    let {structure} = $props()
    import DocumentStructure from "./document-structure.svelte"
    import * as Card from "$lib/components/ui/card/index";
    
    console.log(structure)
</script>
<div class="flex flex-col gap-4">
    {#each structure as element, i}
        {#if Object.hasOwn(element, 'title')}
            <Card.Root>
                <Card.Header>
                    <Card.Title>
                        {element.title}
                    </Card.Title>
                    <Card.Description>
                        {element.block_id}
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    {#if element.blocks.length>0}
                        <DocumentStructure structure={element.blocks}/>
                    {:else}
                        <p>Empty Section</p>
                    {/if}
                </Card.Content>
            </Card.Root>
        {:else}
            <Card.Root>
                <Card.Header>
                    <Card.Title>
                        {element.type}
                    </Card.Title>
                    <Card.Description>
                        {element.block_id}
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    {element.db_id}
                </Card.Content>
            </Card.Root>
        {/if}
    {/each}
</div>