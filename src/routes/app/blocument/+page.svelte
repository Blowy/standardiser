<script lang="ts">
    import {Input} from '$lib/components/ui/input/index';
    import {Button} from '$lib/components/ui/button/index';
    import {Label} from '$lib/components/ui/label/index';
    import {Separator} from '$lib/components/ui/separator/index'
    import {Checkbox} from '$lib/components/ui/checkbox/index'
    import CustomSelect from '$lib/components/custom-select.svelte';
    import DocumentStructure from './document-structure.svelte';
    import {Blocks, Group, Trash, Edit, Move, ArrowUpDown} from 'lucide-svelte'
    import * as RadioGroup from '$lib/components/ui/radio-group/index';
    import {page} from '$app/state';
    import {enhance} from '$app/forms'
    
    let addSectionPosition =$state('start')
    let addSectionNestInSection = $state(false)
    let addSectionPositionNear = $state(false)
    let addBlockPosition =$state('start')
    let addBlockNestInSection = $state(false)
    let addBlockPositionNear = $state(false)
    let moveElementType = $state('up')
    let moveElementComplexNestInSection = $state(false)
    let moveElementPositionNear = $state(false)
    let moveElementComplexPosition = $state('start')
    let moveElementComplexFutureParentToggle = $state(false)
    let moveElementComplexNeighbourToggle = $state(false)
    let addBlockTypeString = $state('')
    let addBlockTypeValues = [
        {value:'requirement', label:'Requirement'},
        {value:'prose', label:'Prose'},
        {value:'media', label:'Media'},
    ]
    import type {DocumentContent} from './document-class'

    let {data} = $props()
    let document = data?.document as DocumentContent
</script>

<div class="flex flex-row">
    <main class="w-3/4 p-4">
        {#if document}
            {#if document.length == 0}
                <p class="text-muted-foreground">Empty Document</p>
            {/if}
            <DocumentStructure structure={data.document}/>
        {/if}
    </main>
    <aside class="flex flex-col bg-sidebar border-l w-1/4">

        <!--Edit Section Title-->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <Group class="size-4"/>
                <span class="font-semibold text-sm">Add Section</span>
            </div>
            <Separator/>
            <form method="post" action="?/addSection" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="addSectionStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="addSectionTitle">Section Title</Label>
                    <Input type="text" name="addSectionTitle" id="addSectionTitle" placeholder="Section Title" class=" bg-background"/>    
                </div>
                <div class="flex items-center gap-4">
                    <Checkbox bind:checked={addSectionNestInSection} class="bg-background"/>
                    <Label for="addSectionNestInSection">Nest in an existing Section?</Label>
                </div>
                {#if addSectionNestInSection}
                    <div class="flex flex-col gap-2">
                        <Label for="addSectionParentId">Nest in Section</Label>
                        <Input type="number" name="addSectionParentId" id="addSectionParentId" class=" bg-background" placeholder="Parent Section Element ID"/>
                    </div>
                {/if}
                <div class="flex items-center gap-4">
                    <Checkbox bind:checked={addSectionPositionNear} class="bg-background"/>
                    <Label for="addSectionPositionNear">Position relative to an existing Block?</Label>
                </div>
                <div class="flex flex-col gap-2">
                    {#if addSectionPositionNear}
                        <Label for="addSectionBlockId">Position Near Other Block</Label>
                        <Input type="number" name="addSectionNeighbourId" id="addSectionNeighbourId" class=" bg-background" placeholder="Neighbour Section Element ID"/>
                    {/if}
                    <RadioGroup.Root name="addSectionPosition" bind:value={addSectionPosition} class="mt-2 ml-1">
                        {#if addSectionPositionNear == false}
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="start" id="addSectionPositionStart" class="bg-background"/>
                                <Label for="addSectionPositionStart">Start of Parent</Label>
                            </div>
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="end" id="addSectionPositionEnd" class="bg-background"/>
                                <Label for="addSectionPositionEnd">End of Parent</Label>
                            </div>
                        {:else}
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="before" id="addSectionPositionBefore" class="bg-background"/>
                                <Label for="addSectionPositionBefore">Before Existing Block</Label>
                            </div>
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="after" id="addSectionPositionAfter" class="bg-background"/>
                                <Label for="addSectionPositionAfter">After Existing Block</Label>
                            </div>
                        {/if}
                    </RadioGroup.Root>
                </div>
                <Button type="submit" class="my-2">Add Section</Button>
            </form>
        </section>
        <Separator/>

        <!--Edit Section Title-->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <Edit class="size-4"/>
                <span class="font-semibold text-sm">Edit Section Title</span>
            </div>
            <Separator/>
            <form method="post" action="?/editSectionTitle" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="editSectionStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="editSectionId">Section Element ID</Label>
                    <Input type="text" name="editSectionId" id="editSectionId" placeholder="Section Element ID" class=" bg-background"/>
                </div>
                <div class="flex flex-col gap-2">
                    <Label for="editSectionTitle">New Section Title</Label>
                    <Input type="text" name="editSectionTitle" id="editSectionTitle" placeholder="Section Title Text" class=" bg-background"/>
                </div>
                <Button type="submit" class="my-2" variant="default">Change Section Title</Button>
            </form>
        </section>
        <Separator/>

        <!--Add Block-->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <Blocks class="size-4"/>
                <span class="font-semibold text-sm">Add Block</span>
            </div>
            <Separator/>
            <form method="post" action="?/addBlock" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="addBlockStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="addBlockType">Block Type</Label>
                    <select name="addBlockType" class="bg-background">
                        {#each addBlockTypeValues as value}
                            <option value={value.value}>{value.label}</option>
                        {/each}
                    </select>
                    <!-- <CustomSelect select_type="single" name="addBlockType" select_value={addBlockTypeString} disabled={false} placeholder="Select Block Type" values={addBlockTypeValues}/> -->
                </div>
                <div class="flex items-center gap-4">
                    <Checkbox bind:checked={addBlockNestInSection} class="bg-background"/>
                    <Label for="addBlockNestInSection">Nest in an existing Section?</Label>
                </div>
                {#if addBlockNestInSection}
                    <div class="flex flex-col gap-2">
                        <Input type="number" name="addBlockParentId" id="addBlockParentId" class=" bg-background" placeholder="Parent Section Element ID"/>
                    </div>
                {/if}
                <div class="flex items-center gap-4">
                    <Checkbox bind:checked={addBlockPositionNear} class="bg-background"/>
                    <Label for="addBlockPositionNear">Position relative to an existing Block?</Label>
                </div>
                <div class="flex flex-col gap-2">
                    {#if addBlockPositionNear}
                        <Input type="number" name="addBlockNeighbourId" id="addBlockNeighbourId" class=" bg-background" placeholder="Neighbour Section Element ID"/>
                    {/if}
                    <RadioGroup.Root name="addBlockPosition" bind:value={addBlockPosition} class="mt-2 ml-1">
                        {#if addBlockPositionNear == false}
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="start" id="addBlockPositionStart" class="bg-background"/>
                                <Label for="addBlockPositionStart">Start of Parent</Label>
                            </div>
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="end" id="addBlockPositionEnd" class="bg-background"/>
                                <Label for="addBlockPositionEnd">End of Parent</Label>
                            </div>
                        {:else}
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="before" id="addBlockPositionBefore" class="bg-background"/>
                                <Label for="addBlockPositionBefore">Before Existing Block</Label>
                            </div>
                            <div class="flex flex-row gap-4">
                                <RadioGroup.Item value="after" id="addBlockPositionAfter" class="bg-background"/>
                                <Label for="addBlockPositionAfter">After Existing Block</Label>
                            </div>
                        {/if}
                    </RadioGroup.Root>
                </div>
                <Button type="submit" class="my-2">Add Block</Button>
            </form>
        </section>
        <Separator/>

        <!--Move Element - Simple -->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <ArrowUpDown class="size-4"/>
                <span class="font-semibold text-sm">Move Element - Simple</span>
            </div>
            <Separator/>
            <form method="post" action="?/moveElement" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="moveElementStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="moveElementId">Section Element ID to Move</Label>
                    <Input type="text" name="moveElementId" id="moveElementId" placeholder="Element ID to Move" class=" bg-background"/>
                </div>
                <div class="flex flex-col gap-2">
                    <Label for="moveElementId">Parent Element</Label>
                    <Input type="text" name="moveElementParentId" id="moveElementParentId" placeholder="Parent Element Id" class=" bg-background"/>
                </div>
                <RadioGroup.Root name="moveElementType" bind:value={moveElementType} class="mt-2 ml-1">
                    <div class="flex flex-row gap-4">
                        <RadioGroup.Item value="up" id="moveElementUp" class="bg-background"/>
                        <Label for="moveElementUp">Move Element Up</Label>
                    </div>
                    <div class="flex flex-row gap-4">
                        <RadioGroup.Item value="down" id="moveElementDown" class="bg-background"/>
                        <Label for="moveElementDown">Move Element Down</Label>
                    </div>
                </RadioGroup.Root>
                <Button type="submit" class="my-2">Move Element</Button>
            </form>
        </section>
        <Separator/>

        <!--Move Element - Complex -->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <Move class="size-4"/>
                <span class="font-semibold text-sm">Move Element - Complex</span>
            </div>
            <Separator/>
            <form method="post" action="?/moveElementComplex" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="moveElementStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="moveElementComplexId">Section Element ID to Move</Label>
                    <Input type="text" name="moveElementComplexId" id="moveElementComplexId" placeholder="Element ID to Move" class=" bg-background"/>
                </div>
                <div class="flex flex-col gap-2">
                    <Label for="moveElementCurrentParentId">Parent Element</Label>
                    <Input type="text" name="moveElementComplexParentId" id="moveElementComplexParentId" placeholder="Parent Element Id" class=" bg-background"/>
                </div>
                <div class="flex items-center gap-4">
                    <Checkbox bind:checked={moveElementComplexFutureParentToggle} class="bg-background"/>
                    <Label>Move into an existing section</Label>
                </div>
                {#if moveElementComplexFutureParentToggle}
                    <div class="flex flex-col gap-2">
                        <Label for="moveElementComplexFutureParentId">Move Element To Section Element ID</Label>
                        <Input type="text" name="moveElementComplexFutureParentId" id="moveElementComplexFutureParentId" placeholder="Parent Section Element ID" class=" bg-background"/>
                    </div>
                {/if}
                <div class="flex items-center gap-4">
                    <Checkbox bind:checked={moveElementComplexNeighbourToggle} class="bg-background"/>
                    <Label>Move relative to existing block</Label>
                </div>
                {#if moveElementComplexNeighbourToggle}
                    <div class="flex flex-col gap-2">
                        <Label for="moveElementComplexFutureNeighbourId">Move Element To Section Element ID</Label>
                        <Input type="text" name="moveElementComplexFutureNeighbourId" id="moveElementComplexFutureNeighbourId" placeholder="Section Element ID" class=" bg-background"/>
                    </div>
                {/if}
                <RadioGroup.Root name="moveElementComplexPosition" bind:value={moveElementComplexPosition} class="mt-2 ml-1">
                    {#if moveElementComplexNeighbourToggle == false}
                        <div class="flex flex-row gap-4">
                            <RadioGroup.Item value="start" id="moveComplexPositionStart" class="bg-background"/>
                            <Label for="moveComplexPositionStart">Start of Parent</Label>
                        </div>
                        <div class="flex flex-row gap-4">
                            <RadioGroup.Item value="end" id="moveComplexPositionEnd" class="bg-background"/>
                            <Label for="moveComplexPositionEnd">End of Parent</Label>
                        </div>
                    {:else}
                        <div class="flex flex-row gap-4">
                            <RadioGroup.Item value="before" id="moveComplexPositionBefore" class="bg-background"/>
                            <Label for="moveComplexPositionBefore">Before Existing Block</Label>
                        </div>
                        <div class="flex flex-row gap-4">
                            <RadioGroup.Item value="after" id="moveComplexPositionAfter" class="bg-background"/>
                            <Label for="moveComplexPositionAfter">After Existing Block</Label>
                        </div>
                    {/if}
                </RadioGroup.Root>
                <Button type="submit" class="my-2">Move Element</Button>
            </form>
        </section>
        <Separator/>

        <!--Delete Section-->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <Trash class="size-4"/>
                <span class="font-semibold text-sm">Delete Section</span>
            </div>
            <Separator/>
            <form method="post" action="?/deleteSection" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="deleteSectionStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="deleteSectionId">Section Element ID</Label>
                    <Input type="text" name="deleteSectionId" id="deleteSectionId" placeholder="Section Element ID" class=" bg-background"/>
                </div>  
                <div class="flex flex-col gap-2">
                    <Label for="deleteSectionParentId">Delete from parent section?</Label>
                    <Input type="text" name="deleteSectionParentId" id="deleteSectionParentId" placeholder="Parent Section Element ID" class=" bg-background"/>
                </div>  
                <Button type="submit" class="my-2" variant="destructive">Delete Section</Button>
            </form>
        </section>
        <Separator/>

        <!--Delete Block-->
        <section>
            <div class=" p-4 flex flex-row gap-2 text-muted-foreground items-center bg-muted">
                <Trash class="size-4"/>
                <span class="font-semibold text-sm">Delete Block</span>
            </div>
            <Separator/>
            <form method="post" action="?/deleteBlock" class="flex flex-col gap-4 p-4" use:enhance>
                <input type="hidden" value={page.url.searchParams.get('id')} name="deleteBlockStandardId"/>
                <div class="flex flex-col gap-2">
                    <Label for="deleteBlockId">Block Element ID</Label>
                    <Input type="text" name="deleteBlockId" id="deleteBlockId" placeholder="Block Element ID" class=" bg-background"/>
                </div>  
                <div class="flex flex-col gap-2">
                    <Label for="deleteSectionParentId">Delete from parent section?</Label>
                    <Input type="text" name="deleteBlockParentId" id="deleteBlockParentId" placeholder="Parent Section Element ID" class=" bg-background"/>
                </div>  
                <Button type="submit" class="my-2" variant="destructive">Delete Block</Button>
            </form>
        </section>
        <Separator/>
    </aside>
</div>

<!--TODO: Complex Moves
    TODO: Locking of Individual Block
    TODO: Locking of Document Structure
    TODO: Updating clients when there is a change
    TODO: Accordions for Sections
    TODO: Block Components for the different types of blocks
    TODO: Refactor of all forms into hovering "form buttons"
    TODO: Hovering Add Between Buttons
    TODO: Bring in Sidebar for editing blocks
    TODO: Refactor all class functions as try catch, with sufficient error messages, transaction style rollback if necessary
    TODO: Refactor all class functions to "Return Early" as opposed to being deeply nested ifs.
    TODO: Add return messages etc. to the class functions so that I can communicate failure to the end user
    TODO: Sonner for successful adds/deletes/edits and for any failures
-->