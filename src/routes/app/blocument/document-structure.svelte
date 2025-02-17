<script lang="ts">
    let {structure, documentId, parentId=undefined} = $props()
    import DocumentStructure from "./document-structure.svelte"
    import * as Accordion from "$lib/components/ui/accordion/index"
    import * as Card from "$lib/components/ui/card/index";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import * as Popover from "$lib/components/ui/popover/index"
    import * as Dialog from "$lib/components/ui/dialog/index"
    import {Button} from "$lib/components/ui/button/index"
    import {Separator} from "$lib/components/ui/separator/index"
    import {Input} from "$lib/components/ui/input/index"
    import {Lock, LockOpen, LoaderCircle, Edit, MoveUp, Trash, MoveDown, Pilcrow, CirclePlus, ListStart, Image, ListChecks, Group, Save, CircleArrowLeft} from "lucide-svelte"
    import type {Element} from "./document-class"
	import { enhance } from "$app/forms";
    
    type StructureMapObject = {
        addAboveOpen: boolean,
        newSectionInput: boolean,
        editTitleInput: boolean,
        addSectionToEmptySection: boolean
    }
    
    let structureMap = $state<StructureMapObject[]>()
    let accordionOpenArray = $state<string[]>([])
    let addToEndInfo = $state({
        open: false,
        addSection: false   
    })
    $effect.pre(()=>{
        structureMap = structure.map(() => {
            return {
                addAboveOpen: false,
                newSectionInput: false,
                editTitleInput: false,
                addSectionToEmptySection: false
            }
        })
        accordionOpenArray = structure.map((element:Element) => {
            if (element && Object.hasOwn(element, 'title')) {
                return `section-${element.block_id}`
            }
        })
    })

    let deleteBlockDialogInfo = $state({
        open: false,
        id: '',
        content: '',
        type: ''
    })

</script>

<div class="flex flex-col">
    {#each structure as element, i}
        <div class="w-full flex flex-row justify-center ">
            <div class="relative group/add-above w-full mt-2">
                <div class={structureMap && structureMap[i].addAboveOpen == true ? "opacity-100 absolute items-center w-full": "opacity-0 group-hover/add-above:opacity-100 absolute items-center w-full transition-opacity duration-300"}>
                   {#if structureMap}
                        <Popover.Root bind:open={structureMap[i].addAboveOpen}>
                            <Popover.Trigger class="w-full" >
                                {#snippet child({props})}
                                    <div {...props} class="flex flex-col items-center w-full">
                                        <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-offset-background ring-orange-500" >
                                            <CirclePlus/>
                                        </Button>
                                        <Separator class="border-orange-500 border-2 absolute top-4 z-0 w-full"/>
                                    </div>
                                {/snippet}
                            </Popover.Trigger>
                            <Popover.Content class="w-full p-0 m-0 border ">
                                <div class="flex flex-row w-auto">
                                    <Button class="h-16 w-16 rounded-r-none border-t-0 border-l-0 border-b-0" variant="outline" onclick={()=>{if(structureMap){structureMap[i].newSectionInput = !structureMap[i].newSectionInput}}}>
                                        {#if structureMap && structureMap[i].newSectionInput == true}
                                            <CircleArrowLeft/>
                                        {:else}
                                            <Group/>
                                        {/if}
                                    </Button>
                                    {#if structureMap && structureMap[i].newSectionInput == true}
                                        <form method="post" action="blocument?/addSection" class="flex flex-row items-center p-2 gap-2" use:enhance>
                                            <input type='hidden' name="addSectionStandardId" value={documentId} />
                                            <input type='hidden' name="addSectionNeighbourId" value={element.block_id} />
                                            <input type='hidden' name='addSectionPosition' value="before"/>
                                            <input type='hidden' name='addSectionParentId' value={parentId}/> 
                                            <Input class="" placeholder="New Section" name="addSectionTitle"/>
                                            <Button variant="default" type="submit"><ListStart/></Button>
                                        </form>                      
                                    {:else}
                                        <form method="post" action="blocument?/addBlock" use:enhance>
                                            <input type="hidden" name="addBlockStandardId" value={documentId} />
                                            <input type="hidden" name="addBlockNeighbourId" value={element.block_id} />
                                            <input type="hidden" name="addBlockPosition" value="before"/>
                                            <input type="hidden" name="addBlockParentId" value={parentId}/>
                                            <input type="hidden" name="addBlockType" value="requirement"/>
                                            <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><ListChecks/></Button>
                                        </form>
                                        <form method="post" action="blocument?/addBlock" use:enhance>
                                            <input type="hidden" name="addBlockStandardId" value={documentId} />
                                            <input type="hidden" name="addBlockNeighbourId" value={element.block_id} />
                                            <input type="hidden" name="addBlockPosition" value="before"/>
                                            <input type="hidden" name="addBlockParentId" value={parentId}/>
                                            <input type="hidden" name="addBlockType" value="prose"/>
                                            <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><Pilcrow/></Button>
                                        </form>
                                        <form method="post" action="blocument?/addBlock" use:enhance>
                                            <input type="hidden" name="addBlockStandardId" value={documentId} />
                                            <input type="hidden" name="addBlockNeighbourId" value={element.block_id} />
                                            <input type="hidden" name="addBlockPosition" value="before"/>
                                            <input type="hidden" name="addBlockParentId" value={parentId}/>
                                            <input type="hidden" name="addBlockType" value="media"/>
                                            <Button type="submit" class="h-16 w-16 rounded-l-none border-0" variant="outline"><Image/></Button>
                                        </form>
                                    {/if}
                                
                                </div>
                            </Popover.Content>
                        </Popover.Root>
                   {/if}
                </div>
                <div class={structureMap && structureMap[i].addAboveOpen == true ? "transition-height delay-75 duration-300 h-11" :"transition-height delay-75 duration-300  h-4 group-hover/add-above:h-11"}></div>
            </div>
        </div>
        {#if Object.hasOwn(element, 'title') && Object.hasOwn(element, 'blocks')}
            <Accordion.Root type="multiple" bind:value={accordionOpenArray}>
                <Accordion.Item value={`section-${element.block_id}`} class="border-1 border shadow">
                    <div class="group/edit-bar relative w-full">
                        <div class="absolute top-3 right-14 transition-opacity duration-300 opacity-0 group-hover/edit-bar:opacity-100">
                            <div class="flex flex-row ">
                                <form method="post" action="blocument?/moveElement" use:enhance>
                                    <input type="hidden" name="moveElementStandardId" value={documentId}/>
                                    <input type="hidden" name="moveElementId" value={element.block_id}/>
                                    <input type="hidden" name="moveElementParentId" value={parentId}/>
                                    <input type="hidden" name="moveElementType" value="up"/>
                                    <Button type="submit" variant="outline" size="icon" class="rounded-r-none border-r-0" disabled={i === 0}>
                                        <MoveUp/>
                                    </Button>
                                </form>
                                
                                <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{if(structureMap){structureMap[i].editTitleInput = !structureMap[i].editTitleInput}}}>
                                    <Edit/>
                                </Button>
                                <form method="post" action="blocument?/deleteSection" use:enhance>
                                    <input type="hidden" name="deleteSectionStandardId" value={documentId}/>
                                    <input type="hidden" name="deleteSectionId" value={element.block_id}/>
                                    <input type="hidden" name="deleteSectionParentId" value={parentId}/>
                                    <Button type="submit" variant="outline" size="icon" class="border-r-0 rounded-none" disabled={element.blocks.length > 0}>
                                        <Trash/>
                                    </Button>
                                </form>
                                
                                <form method="post" action="blocument?/moveElement" use:enhance>
                                    <input type="hidden" name="moveElementStandardId" value={documentId}/>
                                    <input type="hidden" name="moveElementId" value={element.block_id}/>
                                    <input type="hidden" name="moveElementParentId" value={parentId}/>
                                    <input type="hidden" name="moveElementType" value="down"/>
                                    <Button type="submit" variant="outline" size="icon" class="rounded-l-none border" disabled={i === structure.length-1}>
                                        <MoveDown/>
                                    </Button>
                                </form>

                            </div>
                        </div>
                        {#if structureMap && structureMap[i].editTitleInput == true}
                            <div class="absolute top-3 left-3">
                                <form method="post" action="blocument?/editSectionTitle" class="flex flex-row items-center gap-2" use:enhance> 
                                    <input type="hidden" name="editSectionStandardId" value={documentId}/>
                                    <input type="hidden" name="editSectionId" value={element.block_id}/>
                                    <Input type="text" name="editSectionTitle" value={element.title} class="w-48 bg-background"/>
                                    <Button type="submit" size="icon">
                                        <Save/>
                                    </Button>
                                </form>
                            </div>
                        {/if}
                        <Accordion.Trigger data- class="p-4 bg-muted border-b ">
                            {#if structureMap && structureMap[i].editTitleInput == false}
                                <p class="text-lg">{element.title}</p>
                            {:else if structureMap && structureMap[i].editTitleInput == true}
                                <p class="mb-6"> </p>
                            {:else}
                                <LoaderCircle class="size-3 animate-spin"/>
                            {/if}
                        </Accordion.Trigger>
                    </div>
                    <Accordion.Content class="px-4 pt-2 pb-2 rounded-b-xl">
                        {#if element.blocks.length>0}
                            <DocumentStructure structure={element.blocks} documentId={documentId} parentId={element.block_id}/>
                        {:else}
                            <div class="flex flex-row items-center gap-2 pt-4">
                                {#if structureMap && structureMap[i].addSectionToEmptySection == true}
                                    <Button variant="outline" size="icon" onclick={()=>{if(structureMap){structureMap[i].addSectionToEmptySection = !structureMap[i].addSectionToEmptySection}}}><CircleArrowLeft/></Button>
                                    <form method="post" action="blocument?/addSection" use:enhance class="flex flex-row gap-2">
                                        <input type='hidden' name="addSectionStandardId" value={documentId} />
                                        <input type='hidden' name="addSectionNeighbourId" value={undefined} />
                                        <input type='hidden' name='addSectionPosition' value="start"/>
                                        <input type='hidden' name='addSectionParentId' value={element.block_id}/>
                                        <Input class="w-48" placeholder="New Section" name="addSectionTitle"/>
                                        <Button type="submit"><ListStart/></Button>
                                    </form>
                                {:else}
                                    <Button onclick={()=>{if(structureMap){structureMap[i].addSectionToEmptySection = !structureMap[i].addSectionToEmptySection}}}><Group/>Add Section</Button>
                                {/if}
                                <span class="text-muted-foreground font-semibold"> - or - </span> 
                                <form method="post" action="blocument?/addBlock" use:enhance>
                                    <input type="hidden" name="addBlockStandardId" value={documentId} />
                                    <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                    <input type="hidden" name="addBlockPosition" value="start"/>
                                    <input type="hidden" name="addBlockParentId" value={element.block_id}/>
                                    <input type="hidden" name="addBlockType" value="requirement"/>
                                    <Button type="submit" variant="secondary"><ListChecks/> Add Requirement</Button>
                                </form>
                                <form method="post" action="blocument?/addBlock" use:enhance>
                                    <input type="hidden" name="addBlockStandardId" value={documentId} />
                                    <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                    <input type="hidden" name="addBlockPosition" value="start"/>
                                    <input type="hidden" name="addBlockParentId" value={element.block_id}/>
                                    <input type="hidden" name="addBlockType" value="prose"/>
                                    <Button type="submit" variant="secondary"><Pilcrow/> Add Prose</Button>
                                </form>
                                <form method="post" action="blocument?/addBlock" use:enhance>
                                    <input type="hidden" name="addBlockStandardId" value={documentId} />
                                    <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                    <input type="hidden" name="addBlockPosition" value="start"/>
                                    <input type="hidden" name="addBlockParentId" value={element.block_id}/>
                                    <input type="hidden" name="addBlockType" value="media"/>
                                    <Button type="submit" variant="secondary"><Image/> Add Media</Button>
                                </form>
                            </div>
                        {/if}   
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        {:else}
            <Card.Root>
                <div class="group/edit-bar-block relative w-full">
                    <Card.Header>
                        <div class="absolute top-8 right-8 transition-opacity duration-300 opacity-0 group-hover/edit-bar-block:opacity-100">
                            <div class="flex flex-row ">
                                <form method="post" action="blocument?/moveElement" use:enhance>
                                    <input type="hidden" name="moveElementStandardId" value={documentId}/>
                                    <input type="hidden" name="moveElementId" value={element.block_id}/>
                                    <input type="hidden" name="moveElementParentId" value={parentId}/>
                                    <input type="hidden" name="moveElementType" value="up"/>
                                    <Button type="submit" variant="outline" size="icon" class="rounded-r-none border-r-0" disabled={i === 0}>
                                        <MoveUp/>
                                    </Button>
                                </form>
                                <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{if(structureMap){structureMap[i].editTitleInput = !structureMap[i].editTitleInput}}}>
                                    <Edit/>
                                </Button>
                                <div>
                                    <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{
                                            deleteBlockDialogInfo.open = true
                                            deleteBlockDialogInfo.type = element.type
                                            deleteBlockDialogInfo.id = element.block_id
                                        }}>
                                        <Trash/>
                                    </Button>
                                </div>
                                <form method="post" action="blocument?/moveElement" use:enhance>
                                    <input type="hidden" name="moveElementStandardId" value={documentId}/>
                                    <input type="hidden" name="moveElementId" value={element.block_id}/>
                                    <input type="hidden" name="moveElementParentId" value={parentId}/>
                                    <input type="hidden" name="moveElementType" value="down"/>
                                    <Button type="submit" variant="outline" size="icon" class="rounded-l-none border" disabled={i === structure.length-1}>
                                        <MoveDown/>
                                    </Button>
                                </form>
                            </div>
                        </div>
                    
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex flex-col gap-2 w-2/3">
                            <Card.Title class="w-full">
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
            </div>
                <Card.Content>
                    {element.db_id}
                </Card.Content>
            </Card.Root>
        {/if}
    {/each}
    <div class="w-full flex flex-row justify-center mt-0 pt-2">
        <div class="relative group/add-above w-full">
            <div class={addToEndInfo.open == true ? "opacity-100 absolute items-center w-full": "opacity-0 group-hover/add-above:opacity-100 absolute items-center w-full transition-opacity delay-75 duration-300"}>
                <Popover.Root bind:open={addToEndInfo.open}>
                    <Popover.Trigger class="w-full">
                        {#snippet child({props})}
                            <div {...props} class="flex flex-col items-center w-full">
                                <Button variant="outline" size="icon" class="z-10 ring-2 ring-offset-2 ring-offset-background ring-orange-500">
                                    <CirclePlus/>
                                </Button>
                                <Separator class="border-orange-500 border-2 absolute top-4 z-0 w-full"/>
                            </div>
                        {/snippet}
                    </Popover.Trigger>
                    <Popover.Content class="w-full p-0 m-0 border ">
                        <div class="flex flex-row w-auto">
                            <Button class="h-16 w-16 rounded-r-none border-t-0 border-l-0 border-b-0" variant="outline" onclick={()=>{addToEndInfo.addSection = !addToEndInfo.addSection}}>
                                {#if addToEndInfo.addSection == true}
                                    <CircleArrowLeft/>
                                {:else}
                                    <Group/>
                                {/if}
                            </Button>
                            {#if addToEndInfo.addSection == true}
                                <form method="post" action="blocument?/addSection" class="flex flex-row items-center p-2 gap-2" use:enhance>
                                    <input type='hidden' name="addSectionStandardId" value={documentId} />
                                    <input type='hidden' name="addSectionNeighbourId" value={undefined} />
                                    <input type='hidden' name='addSectionPosition' value="end"/>
                                    <input type='hidden' name='addSectionParentId' value={parentId}/> 
                                    <Input class="" placeholder="New Section" name="addSectionTitle"/>
                                    <Button variant="default" type="submit"><ListStart/></Button>
                                </form>                      
                            {:else}
                                <form method="post" action="blocument?/addBlock" use:enhance>
                                    <input type="hidden" name="addBlockStandardId" value={documentId} />
                                    <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                    <input type="hidden" name="addBlockPosition" value="end"/>
                                    <input type="hidden" name="addBlockParentId" value={parentId}/>
                                    <input type="hidden" name="addBlockType" value="requirement"/>
                                    <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><ListChecks/></Button>
                                </form>
                                <form method="post" action="blocument?/addBlock" use:enhance>
                                    <input type="hidden" name="addBlockStandardId" value={documentId} />
                                    <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                    <input type="hidden" name="addBlockPosition" value="end"/>
                                    <input type="hidden" name="addBlockParentId" value={parentId}/>
                                    <input type="hidden" name="addBlockType" value="prose"/>
                                    <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><Pilcrow/></Button>
                                </form>
                                <form method="post" action="blocument?/addBlock" use:enhance>
                                    <input type="hidden" name="addBlockStandardId" value={documentId} />
                                    <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                    <input type="hidden" name="addBlockPosition" value="end"/>
                                    <input type="hidden" name="addBlockParentId" value={parentId}/>
                                    <input type="hidden" name="addBlockType" value="media"/>
                                    <Button type="submit" class="h-16 w-16 rounded-l-none border-0" variant="outline"><Image/></Button>
                                </form>
                            {/if}
                        </div>
                    </Popover.Content>
                </Popover.Root>
            </div>
            <div class={"transition-height delay-75 duration-300  h-2 group-hover/add-above:h-4"}></div>
        </div>
    </div>
</div>
<Dialog.Root bind:open={deleteBlockDialogInfo.open}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>
                Delete {deleteBlockDialogInfo.type} block?
            </Dialog.Title>
            <Dialog.Description>
                {#if deleteBlockDialogInfo.type != 'media'}
                    {deleteBlockDialogInfo.content}
                {:else}
                    <img src={deleteBlockDialogInfo.content} alt="Media"/>
                {/if}
            </Dialog.Description>
        </Dialog.Header>
        <div>
            <p>Are you sure you want to delete this {deleteBlockDialogInfo.type} block? This is irreversible and will lead to data loss.</p>
        </div>
        <Dialog.Footer class="flex flex-row gap-2">
            <Button variant="secondary" onclick={()=>{deleteBlockDialogInfo.open = !deleteBlockDialogInfo.open}}>Cancel</Button>
            <form method="post" action="blocument?/deleteBlock" use:enhance>
                <input type="hidden" name="deleteBlockStandardId" value={documentId}/>
                <input type="hidden" name="deleteBlockId" value={deleteBlockDialogInfo.id}/>
                <input type="hidden" name="deleteBlockParentId" value={parentId}/>
                <Button variant="destructive" type="submit" onclick={()=>{deleteBlockDialogInfo.open = !deleteBlockDialogInfo.open}}><Trash/>Delete</Button>
            </form>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>