<script lang="ts">
    let {structure, documentId, parentId=undefined} = $props()
    import DocumentStructure from "$lib/aegis-block-document/document-structure.svelte"
    import * as Accordion from "$lib/components/ui/accordion/index"
    import * as Card from "$lib/components/ui/card/index";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import * as Popover from "$lib/components/ui/popover/index"
    import * as Dialog from "$lib/components/ui/dialog/index"
    import {Button} from "$lib/components/ui/button/index"
    import {Separator} from "$lib/components/ui/separator/index"
    import {Input} from "$lib/components/ui/input/index"
    import {Lock, LockOpen, LoaderCircle, Edit, MoveUp, Trash, MoveDown, Pilcrow, CirclePlus, ListStart, Image, ListChecks, Group, Save, CircleArrowLeft} from "lucide-svelte"
    import type {Element} from "$lib/aegis-block-document/document-class.svelte"
	import { enhance } from "$app/forms";
    import {Traverse} from "neotraverse/modern"
    import {sidebarState} from "$lib/aegis-block-document/sidebar-state.svelte"
    import Requirement from "$lib/aegis-block-document/requirement.svelte"
    import Prose from "$lib/aegis-block-document/prose.svelte"
    import Media from "$lib/aegis-block-document/media.svelte"
    
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
    let emptyPageInfo = $state({
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
        <div class="w-full flex flex-row justify-center mt-2">
            <div class="relative group/add-above w-full">
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
                                        <form method="post" action="standards?/addSection" class="flex flex-row items-center p-2 gap-2" use:enhance>
                                            <input type='hidden' name="addSectionStandardId" value={documentId} />
                                            <input type='hidden' name="addSectionNeighbourId" value={element.block_id} />
                                            <input type='hidden' name='addSectionPosition' value="before"/>
                                            <input type='hidden' name='addSectionParentId' value={parentId}/> 
                                            <Input class="" placeholder="New Section" name="addSectionTitle"/>
                                            <Button variant="default" type="submit"><ListStart/></Button>
                                        </form>                      
                                    {:else}
                                        <form method="post" action="standards?/addBlock" use:enhance>
                                            <input type="hidden" name="addBlockStandardId" value={documentId} />
                                            <input type="hidden" name="addBlockNeighbourId" value={element.block_id} />
                                            <input type="hidden" name="addBlockPosition" value="before"/>
                                            <input type="hidden" name="addBlockParentId" value={parentId}/>
                                            <input type="hidden" name="addBlockType" value="requirement"/>
                                            <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><ListChecks/></Button>
                                        </form>
                                        <form method="post" action="standards?/addBlock" use:enhance>
                                            <input type="hidden" name="addBlockStandardId" value={documentId} />
                                            <input type="hidden" name="addBlockNeighbourId" value={element.block_id} />
                                            <input type="hidden" name="addBlockPosition" value="before"/>
                                            <input type="hidden" name="addBlockParentId" value={parentId}/>
                                            <input type="hidden" name="addBlockType" value="prose"/>
                                            <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><Pilcrow/></Button>
                                        </form>
                                        <form method="post" action="standards?/addBlock" use:enhance>
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
            <Card.Root>
                <div class="group/edit-bar relative w-full">
                    <div class="absolute top-3 right-3 transition-opacity duration-300 opacity-0 group-hover/edit-bar:opacity-100">
                        <div class="flex flex-row ">
                            
                            <form method="post" action="standards?/moveElementInto" use:enhance>
                                <input type="hidden" name="moveElementIntoStandardId" value={documentId}/>
                                <input type="hidden" name="moveElementIntoId" value={element.block_id}/>
                                <input type="hidden" name="moveElementIntoType" value="up"/>
                                <Button type="submit" variant="outline" size="icon" class="rounded-r-none border-r-0" disabled={element.block_id === 1}>
                                    <MoveUp/>
                                </Button>
                            </form>
                            
                            <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{if(structureMap){structureMap[i].editTitleInput = !structureMap[i].editTitleInput}}}>
                                <Edit/>
                            </Button>
                            <form method="post" action="standards?/deleteSection" use:enhance>
                                <input type="hidden" name="deleteSectionStandardId" value={documentId}/>
                                <input type="hidden" name="deleteSectionId" value={element.block_id}/>
                                <input type="hidden" name="deleteSectionParentId" value={parentId}/>
                                <Button type="submit" variant="outline" size="icon" class="border-r-0 rounded-none" disabled={element.blocks.length > 0}>
                                    <Trash/>
                                </Button>
                            </form>

                            <form method="post" action="standards?/moveElementInto" use:enhance>
                                <input type="hidden" name="moveElementIntoStandardId" value={documentId}/>
                                <input type="hidden" name="moveElementIntoId" value={element.block_id}/>
                                <input type="hidden" name="moveElementIntoType" value="down"/>
                                <Button type="submit" variant="outline" size="icon" class="rounded-l-none border">
                                    <MoveDown/>
                                </Button>
                            </form>

                        </div>
                    </div>
                    {#if structureMap && structureMap[i].editTitleInput == true}
                        <div class="absolute top-3 left-3">
                            <form method="post" action="standards?/editSectionTitle" class="flex flex-row items-center gap-2" use:enhance> 
                                <input type="hidden" name="editSectionStandardId" value={documentId}/>
                                <input type="hidden" name="editSectionId" value={element.block_id}/>
                                <Input type="text" name="editSectionTitle" value={element.title} class="w-48 bg-background"/>
                                <Button type="submit" size="icon">
                                    <Save/>
                                </Button>
                            </form>
                        </div>
                    {/if}
                    <Card.Header data- class="p-4 border-b bg-muted/75 rounded-t-xl">
                        {#if structureMap && structureMap[i].editTitleInput == false}
                            <p class="font-semibold">{element.title}</p>
                        {:else if structureMap && structureMap[i].editTitleInput == true}
                            <p class="mb-6"> </p>
                        {:else}
                            <LoaderCircle class="size-3 animate-spin"/>
                        {/if}
                    </Card.Header>
                </div>
                <Card.Content class="bg-muted/25 py-2">
                    {#if element.blocks.length>0}
                        <DocumentStructure structure={element.blocks} documentId={documentId} parentId={element.block_id}/>
                    {:else}
                        <div class="flex flex-row items-center ">
                            {#if structureMap && structureMap[i].addSectionToEmptySection == true}
                                <Button variant="outline" size="icon" onclick={()=>{if(structureMap){structureMap[i].addSectionToEmptySection = !structureMap[i].addSectionToEmptySection}}}><CircleArrowLeft/></Button>
                                <form method="post" action="standards?/addSection" use:enhance class="flex flex-row gap-2">
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
                            <form method="post" action="standards?/addBlock" use:enhance>
                                <input type="hidden" name="addBlockStandardId" value={documentId} />
                                <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                <input type="hidden" name="addBlockPosition" value="start"/>
                                <input type="hidden" name="addBlockParentId" value={element.block_id}/>
                                <input type="hidden" name="addBlockType" value="requirement"/>
                                <Button type="submit" variant="secondary"><ListChecks/> Add Requirement</Button>
                            </form>
                            <form method="post" action="standards?/addBlock" use:enhance>
                                <input type="hidden" name="addBlockStandardId" value={documentId} />
                                <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                <input type="hidden" name="addBlockPosition" value="start"/>
                                <input type="hidden" name="addBlockParentId" value={element.block_id}/>
                                <input type="hidden" name="addBlockType" value="prose"/>
                                <Button type="submit" variant="secondary"><Pilcrow/> Add Prose</Button>
                            </form>
                            <form method="post" action="standards?/addBlock" use:enhance>
                                <input type="hidden" name="addBlockStandardId" value={documentId} />
                                <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                <input type="hidden" name="addBlockPosition" value="start"/>
                                <input type="hidden" name="addBlockParentId" value={element.block_id}/>
                                <input type="hidden" name="addBlockType" value="media"/>
                                <Button type="submit" variant="secondary"><Image/> Add Media</Button>
                            </form>
                        </div>
                    {/if}   
                </Card.Content>
            </Card.Root>
        {:else}
            <Card.Root>
                <div class="group/edit-bar-block relative w-full">
                    <Card.Header class="border-b p-4 bg-muted rounded-t-xl">
                        <div class="absolute top-3 right-3 transition-opacity duration-300 opacity-0 group-hover/edit-bar-block:opacity-100">
                            <div class="flex flex-row ">
                                <form method="post" action="standards?/moveElementInto" use:enhance>
                                    <input type="hidden" name="moveElementIntoStandardId" value={documentId}/>
                                    <input type="hidden" name="moveElementIntoId" value={element.block_id}/>
                                    <input type="hidden" name="moveElementIntoType" value="up"/>
                                    <Button type="submit" variant="outline" size="icon" class="rounded-r-none border-r-0" disabled={element.block_id === 1}>
                                        <MoveUp/>
                                    </Button>
                                </form>
                                <Button variant="outline" size="icon" class="border-r-0 rounded-none" onclick={()=>{
                                    sidebarState.setActiveItem(element.db_id)
                                    sidebarState.setActiveItemType(element.type)
                                    sidebarState.setOpen(true)
                                }}>
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
                                <form method="post" action="standards?/moveElementInto" use:enhance>
                                    <input type="hidden" name="moveElementIntoStandardId" value={documentId}/>
                                    <input type="hidden" name="moveElementIntoId" value={element.block_id}/>
                                    <input type="hidden" name="moveElementIntoType" value="down"/>
                                    <Button type="submit" variant="outline" size="icon" class="rounded-l-none border">
                                        <MoveDown/>
                                    </Button>
                                </form>
                            </div>
                        </div>
                        <div class="flex flex-row justify-between items-center">
                            <div class="text-sm text-muted-foreground w-2/3">
                                {#if element.type == 'requirement'}
                                    <div class="flex flex-row gap-2 items-center">
                                        <ListChecks class="size-4"/>
                                        <span>Requirement (ID: {element.db_id})</span>
                                    </div>
                                {:else if element.type == 'prose'}
                                    <div class="flex flex-row gap-2 items-center">
                                        <Pilcrow class="size-4"/>
                                        <span>Prose Block (ID: {element.db_id})</span>
                                    </div>
                                {:else if element.type == 'media'}
                                    <div class="flex flex-row gap-2 items-center">
                                        <Image class="size-4"/>
                                        <span>Media (ID: {element.db_id})</span>
                                    </div>
                                {/if}
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
                    {#if element.type == 'requirement'}
                        <Requirement id={element.db_id}/>
                    {:else if element.type == 'prose'}
                        <Prose id={element.db_id}/>
                    {:else if element.type == 'media'}
                        <Media id={element.db_id}/>
                    {/if}
                </Card.Content>
            </Card.Root>
        {/if}
    {/each}
    {#if structure.length == 0}
        <div class="flex flex-col gap-2 p-4">
            <p class="text-lg text-muted-foreground font-semibold">Empty Document</p>
            <p class="text-md text-muted-foreground">Add a Section or Block to get started</p>
        </div>
        <Separator/>
        <div class="flex flex-row items-center gap-2 p-4">
            {#if emptyPageInfo.addSection == true}
                <Button variant="outline" size="icon" onclick={()=>{emptyPageInfo.addSection= !emptyPageInfo.addSection}}><CircleArrowLeft/></Button>
                <form method="post" action="standards?/addSection" use:enhance class="flex flex-row gap-2">
                    <input type='hidden' name="addSectionStandardId" value={documentId} />
                    <input type='hidden' name="addSectionNeighbourId" value={undefined} />
                    <input type='hidden' name='addSectionPosition' value="start"/>
                    <input type='hidden' name='addSectionParentId' value={undefined}/>
                    <Input class="w-48" placeholder="New Section" name="addSectionTitle"/>
                    <Button type="submit" onclick={()=>{
                            setTimeout(()=>{emptyPageInfo.addSection= !emptyPageInfo.addSection}, 500)
                        }}>
                        <ListStart/>
                    </Button>
                </form>
            {:else}
                <Button onclick={()=>{emptyPageInfo.addSection = !emptyPageInfo.addSection}}><Group/>Add Section</Button>
            {/if}
            <span class="text-muted-foreground font-semibold"> - or - </span> 
            <form method="post" action="standards?/addBlock" use:enhance>
                <input type="hidden" name="addBlockStandardId" value={documentId} />
                <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                <input type="hidden" name="addBlockPosition" value="start"/>
                <input type="hidden" name="addBlockParentId" value={undefined}/>
                <input type="hidden" name="addBlockType" value="requirement"/>
                <Button type="submit" variant="secondary"><ListChecks/> Add Requirement</Button>
            </form>
            <form method="post" action="standards?/addBlock" use:enhance>
                <input type="hidden" name="addBlockStandardId" value={documentId} />
                <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                <input type="hidden" name="addBlockPosition" value="start"/>
                <input type="hidden" name="addBlockParentId" value={undefined}/>
                <input type="hidden" name="addBlockType" value="prose"/>
                <Button type="submit" variant="secondary"><Pilcrow/> Add Prose</Button>
            </form>
            <form method="post" action="standards?/addBlock" use:enhance>
                <input type="hidden" name="addBlockStandardId" value={documentId} />
                <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                <input type="hidden" name="addBlockPosition" value="start"/>
                <input type="hidden" name="addBlockParentId" value={undefined}/>
                <input type="hidden" name="addBlockType" value="media"/>
                <Button type="submit" variant="secondary"><Image/> Add Media</Button>
            </form>
        </div>
    {:else}
        <div class="w-full flex flex-row justify-center mt-0 pt-2 pb-1 px-4">
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
                                    <form method="post" action="standards?/addSection" class="flex flex-row items-center p-2 gap-2" use:enhance>
                                        <input type='hidden' name="addSectionStandardId" value={documentId} />
                                        <input type='hidden' name="addSectionNeighbourId" value={undefined} />
                                        <input type='hidden' name='addSectionPosition' value="end"/>
                                        <input type='hidden' name='addSectionParentId' value={parentId}/> 
                                        <Input class="" placeholder="New Section" name="addSectionTitle"/>
                                        <Button variant="default" type="submit"><ListStart/></Button>
                                    </form>                      
                                {:else}
                                    <form method="post" action="standards?/addBlock" use:enhance>
                                        <input type="hidden" name="addBlockStandardId" value={documentId} />
                                        <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                        <input type="hidden" name="addBlockPosition" value="end"/>
                                        <input type="hidden" name="addBlockParentId" value={parentId}/>
                                        <input type="hidden" name="addBlockType" value="requirement"/>
                                        <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><ListChecks/></Button>
                                    </form>
                                    <form method="post" action="standards?/addBlock" use:enhance>
                                        <input type="hidden" name="addBlockStandardId" value={documentId} />
                                        <input type="hidden" name="addBlockNeighbourId" value={undefined} />
                                        <input type="hidden" name="addBlockPosition" value="end"/>
                                        <input type="hidden" name="addBlockParentId" value={parentId}/>
                                        <input type="hidden" name="addBlockType" value="prose"/>
                                        <Button type="submit" class="h-16 w-16 rounded-none border-t-0 border-b-0 border-l-0" variant="outline"><Pilcrow/></Button>
                                    </form>
                                    <form method="post" action="standards?/addBlock" use:enhance>
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
    {/if}
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
            <form method="post" action="standards?/deleteBlock" use:enhance>
                <input type="hidden" name="deleteBlockStandardId" value={documentId}/>
                <input type="hidden" name="deleteBlockId" value={deleteBlockDialogInfo.id}/>
                <input type="hidden" name="deleteBlockParentId" value={parentId}/>
                <Button variant="destructive" type="submit" onclick={()=>{deleteBlockDialogInfo.open = !deleteBlockDialogInfo.open}}><Trash/>Delete</Button>
            </form>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>