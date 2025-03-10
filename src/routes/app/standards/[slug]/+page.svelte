<script lang="ts">
    import {Input} from '$lib/components/ui/input/index';
    import {Button} from '$lib/components/ui/button/index';
    import {Label} from '$lib/components/ui/label/index';
    import {Separator} from '$lib/components/ui/separator/index'
    import {Checkbox} from '$lib/components/ui/checkbox/index'
    import {Badge} from '$lib/components/ui/badge/index';
    import {ScrollArea} from '$lib/components/ui/scroll-area/index';
    import DocumentStructure from '../../../../lib/aegis-block-document/document-structure.svelte';
    import {Blocks, Group, Trash, Edit, Move, ArrowUpDown, Lock, LockOpen, PanelRight} from 'lucide-svelte'
    import * as RadioGroup from '$lib/components/ui/radio-group/index';
    import * as Tabs from '$lib/components/ui/tabs/index';
    import {page} from '$app/state';
    import {enhance} from '$app/forms';
    import {Traverse} from 'neotraverse/modern';
    
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
    let lockElementUser = $state('user 1')
    let unlockElementUser = $state('user 1')
    let addBlockTypeString = $state('')
    let addBlockTypeValues = [
        {value:'requirement', label:'Requirement'},
        {value:'prose', label:'Prose'},
        {value:'media', label:'Media'},
    ]

    let {data} = $props()
    let standard = data.standard
    let document = data.document
    import RequirementsSidebar from '$lib/aegis-block-document/requirements-sidebar.svelte';
    import ProseSidebar from '$lib/aegis-block-document/prose-sidebar.svelte';
    import MediaSidebar from '$lib/aegis-block-document/media-sidebar.svelte';
    import {sidebarState} from "$lib/aegis-block-document/sidebar-state.svelte";

    let sidebarActiveItem = $derived(sidebarState.getActiveItem());
    let sidebarActiveItemType = $derived(sidebarState.getActiveItemType());
    let sidebarOpen = $derived(sidebarState.isOpen());
    
</script>

<Tabs.Root class="flex flex-col w-full h-full" value="document">
    <div class="h-28 lg:h-16 border-b p-4 flex flex-col gap-4 lg:flex-row justify-between"><!--sm: 7rem, lg:4rem-->
        <div class="flex flex-row items-center lg:items-baseline gap-4 justify-between">
            <div class="flex flex-row gap-4 items-center lg:w-auto lg:max-w-xl">
                <h1 class="text-xl font-semibold truncate">{data.standard?.title}</h1>
                <Badge class={data.standard?.status == "gold" ? "bg-yellow-600 hover:bg-yellow-700 text-white border-0 shrink-0": data.standard?.status == "silver" ? "bg-gray-400 hover:bg-gray-500 text-white border-0 shrink-0" : "bg-orange-700 hover:bg-orange-800 text-white border-0 shrink-0"}>{data.standard?.docNumber} {data.standard?.version}</Badge>
            </div>
        </div>
        <Tabs.List>
            <Tabs.List class="grid w-full grid-cols-2 lg:block lg:w-auto">
                <Tabs.Trigger value="document">Document</Tabs.Trigger>
                <Tabs.Trigger value="requirements">Requirements</Tabs.Trigger>
            </Tabs.List>
        </Tabs.List>
    </div>
    <Tabs.Content value="document" class="h-full m-0">
        <div class="flex flex-row">
            <main class={sidebarOpen ? "w-2/3" : "w-full"}>
                <ScrollArea class="h-[calc(100vh-8rem)] px-4">
                    {#if document}
                        <DocumentStructure structure={data.document} documentId={data.standard.id}  />
                    {/if}
                </ScrollArea>
            </main>
            {#if sidebarState.isOpen() == true}
                <aside class="w-1/3 border-l">
                    <div class="h-16 flex flex-row border-b">
                        <div class="w-16 border-r flex flex-row justify-center items-center">
                            <Button size="icon" variant="ghost" onclick={()=>{sidebarState.setOpen(false)}}><PanelRight/></Button>
                        </div>
                        <div class="flex flex-row items-center p-4">
                            {#if sidebarActiveItemType == "requirement"}
                                <h2 class="font-semibold text-muted-foreground">Requirement (ID:{sidebarActiveItem})</h2>
                            {/if}
                            {#if sidebarActiveItemType == "prose"}
                                <h2 class="font-semibold text-muted-foreground">Prose (ID:{sidebarActiveItem})</h2>
                            {/if}
                            {#if sidebarActiveItemType == "media"}
                                <h2 class="font-semibold text-muted-foreground">Media (ID:{sidebarActiveItem})</h2>
                            {/if}
                            <p></p>
                        </div>
                    </div>
                    <ScrollArea class="lg:h-[calc(100vh-11.25rem)]">
                        {#if sidebarActiveItemType == "requirement"}
                            <RequirementsSidebar id={sidebarActiveItem}/>
                        {/if}
                        {#if sidebarActiveItemType == "prose"}
                            <ProseSidebar id={sidebarActiveItem}/>
                        {/if}
                        {#if sidebarActiveItemType == "media"}
                            <MediaSidebar id={sidebarActiveItem}/>
                        {/if}
                    </ScrollArea>
                </aside>
            {/if}
        </div>
    </Tabs.Content>
    <Tabs.Content value="requirements">
        Requirements
    </Tabs.Content>
</Tabs.Root>

<!--TODO: Updating clients when there is a change
    TODO: Block Components for the different types of blocks
    TODO: Bring in Sidebar for editing blocks
    TODO: Add return messages etc. to the class functions so that I can communicate failure to the end user
    TODO: Sonner for successful adds/deletes/edits and for any failures
-->