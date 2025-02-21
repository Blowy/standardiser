<script lang="ts">
    import type { PageData } from './$types';
    import {Badge} from "$lib/components/ui/badge/index";
    import {ScrollArea} from "$lib/components/ui/scroll-area/index";
    import {Switch} from "$lib/components/ui/switch/index";
    import {Label} from "$lib/components/ui/label/index";
    import {Separator} from "$lib/components/ui/separator/index";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index"; 
    import * as Tabs from "$lib/components/ui/tabs/index";
    import * as Accordion from "$lib/components/ui/accordion/index";
	import { buttonVariants } from '$lib/components/ui/button';
    import {CirclePlay, Trash, FolderDown, FileDown, Edit, FileUp, ListPlus, ListX, MoveUp, MoveDown,Eye,Save, Ellipsis, CircleHelp, PencilRuler, PanelRight} from "lucide-svelte";
    import {Button} from '$lib/components/ui/button/index';
    import {Input} from '$lib/components/ui/input/index';
    import {Textarea} from '$lib/components/ui/textarea/index';
    import { Checkbox } from "$lib/components/ui/checkbox/index"
    import * as Select from "$lib/components/ui/select/index";
    import * as Card from "$lib/components/ui/card/index";
    import * as Alert from "$lib/components/ui/alert/index"
    import RequirementsSidebar from '$lib/aegis-block-document/requirements-sidebar.svelte';
    import ProseSidebar from '$lib/aegis-block-document/prose-sidebar.svelte';
    import MediaSidebar from '$lib/aegis-block-document/media-sidebar.svelte';
    import {sidebarState} from "$lib/aegis-block-document/sidebar-state.svelte";
    import DocumentStructure from '$lib/aegis-block-document/document-structure.svelte';

    let sidebarActiveItem = $derived(sidebarState.getActiveItem());
    let sidebarActiveItemType = $derived(sidebarState.getActiveItemType());
    let sidebarOpen = $derived(sidebarState.isOpen());

    import * as Popover from "$lib/components/ui/popover/index"

    let { data }: { data: PageData } = $props();
    


    let section_title = $state('')

    let document:any = $state(data.content)
</script>

<Tabs.Root class="flex flex-col w-full h-full" value="document">
    <div class="h-28 lg:h-16 border-b p-4 flex flex-col gap-4 lg:flex-row justify-between"><!--sm: 7rem, lg:4rem-->
        <div class="flex flex-row items-center lg:items-baseline gap-4 justify-between">
            <div class="flex flex-row gap-4 items-center lg:w-auto lg:max-w-xl">
                <h1 class="text-xl font-semibold truncate">{data.selectedStandard?.title}</h1>
                <Badge class={data.selectedStandard?.status == "gold" ? "bg-yellow-600 hover:bg-yellow-700 text-white border-0 shrink-0": data.selectedStandard?.status == "silver" ? "bg-gray-400 hover:bg-gray-500 text-white border-0 shrink-0" : "bg-orange-700 hover:bg-orange-800 text-white border-0 shrink-0"}>{data.selectedStandard?.docNumber} {data.selectedStandard?.version}</Badge>
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
        <div class="flex flex-row w-full h-full">
            <div class="w-full border-r h-full {sidebarOpen ? 'lg:w-2/3' : 'lg:w-full'}">
                <ScrollArea class=" border-b px-4 py-2 h-[calc(100vh-14.25rem)] lg:h-[calc(100vh-8rem)]">
                    {#if document.length == 0}
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
                        <DocumentStructure structure={data.content} documentId={data.standardId}/>
                    {/if}
                </ScrollArea>
            </div>
            {#if sidebarOpen}
                <div class="hidden lg:block w-1/3 h-full ">
                    <div class="flex flex-row justify-start w-full p-2 border-b">
                        <Button size="icon" variant="ghost" onclick={()=>{sidebarState.setOpen(false)}}><PanelRight/></Button>
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
                </div>
            {/if}
        </div>
    </Tabs.Content>
    <Tabs.Content value="requirements">
        Requirements
    </Tabs.Content>
</Tabs.Root>
