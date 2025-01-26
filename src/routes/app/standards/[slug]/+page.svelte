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
    import RequirementsSidebar from './requirements-sidebar.svelte';
    import ProseSidebar from './prose-sidebar.svelte';
    import MediaSidebar from './media-sidebar.svelte';
    import {sidebarState} from "./sidebar-state.svelte";

    let sidebarActiveItem = $derived(sidebarState.getActiveItem());
    let sidebarActiveItemType = $derived(sidebarState.getActiveItemType());
    let sidebarOpen = $derived(sidebarState.isOpen());

    import * as Popover from "$lib/components/ui/popover/index"

    import DocStructure from './doc-structure.svelte';

    let { data }: { data: PageData } = $props();
    
    let defaultOpen = data.data_test.standard.map((item:any)=>{
        return item.block_id.toString()
    })

    let edit_structure = $state(false);
</script>

<Tabs.Root class="flex flex-col w-full h-full" value="requirements">
    <div class="h-28 lg:h-16 border-b p-4 flex flex-col gap-4 lg:flex-row justify-between"><!--sm: 7rem, lg:4rem-->
        <div class="flex flex-row items-center lg:items-baseline gap-4 justify-between">
            <div class="flex flex-row gap-4 items-center w-96 lg:w-auto lg:max-w-xl">
                <h1 class="text-xl font-semibold truncate">{data.page_standard?.title}</h1>
                <Badge class={data.page_standard?.status == "gold" ? "bg-yellow-600 hover:bg-yellow-700 text-white border-0 shrink-0": data.page_standard?.status == "silver" ? "bg-gray-400 hover:bg-gray-500 text-white border-0 shrink-0" : "bg-orange-700 hover:bg-orange-800 text-white border-0 shrink-0"}>{data.page_standard?.docNumber} {data.page_standard?.version}</Badge>
            </div>
            <div class="block lg:hidden">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger class={buttonVariants({variant: 'default'})}>
                        <CirclePlay/>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Item><Edit/>Edit Metadata</DropdownMenu.Item>
                        <Separator class="my-2"/>
                        <DropdownMenu.Group>
                            <DropdownMenu.GroupHeading>Export</DropdownMenu.GroupHeading>
                            <DropdownMenu.Item>Export Standard as Word Document</DropdownMenu.Item>
                            <DropdownMenu.Item>Export Standard as Excel Document</DropdownMenu.Item>
                            <DropdownMenu.Item>Export Alignment Traceability</DropdownMenu.Item>
                            <DropdownMenu.Item>Export Items to Note</DropdownMenu.Item>
                            <DropdownMenu.Item>Export Sources & Inputs</DropdownMenu.Item>
                            <DropdownMenu.Item>Export All Items</DropdownMenu.Item>
                        </DropdownMenu.Group>
                        <Separator class="my-2"/>
                        <DropdownMenu.Group>
                            <DropdownMenu.GroupHeading>Import</DropdownMenu.GroupHeading>
                            <DropdownMenu.Item>Import Word Document</DropdownMenu.Item>
                            <DropdownMenu.Item>Import Excel Document</DropdownMenu.Item>
                        </DropdownMenu.Group>
                        <Separator class="my-2"/>
                        <DropdownMenu.Item class={buttonVariants({variant:"destructive"})+"p-0 w-full justify-start"}>
                            <Trash></Trash>
                            Delete Standard
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>
        </div>
        
        <Tabs.List>
            <Tabs.List class="grid w-full grid-cols-2 lg:block lg:w-auto">
                <Tabs.Trigger value="requirements">Requirements</Tabs.Trigger>
                <Tabs.Trigger value="traceability">Traceability</Tabs.Trigger>
            </Tabs.List>
        </Tabs.List>
        <div class="hidden lg:block ">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger class={buttonVariants({variant: 'default'})}>
                    <FileUp/>
                    Import
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                        <DropdownMenu.Item>Import Word Document</DropdownMenu.Item>
                        <DropdownMenu.Item>Import Excel Document</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger class={buttonVariants({variant: 'default'})}>
                    <FileDown/>
                    Export
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                        <DropdownMenu.Item>Export Standard as Word Document</DropdownMenu.Item>
                        <DropdownMenu.Item>Export Standard as Excel Document</DropdownMenu.Item>
                        <DropdownMenu.Item>Export Alignment Traceability</DropdownMenu.Item>
                        <DropdownMenu.Item>Export Items to Note</DropdownMenu.Item>
                        <DropdownMenu.Item>Export Sources & Inputs</DropdownMenu.Item>
                        <DropdownMenu.Item>Export All Items</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>
    <Tabs.Content value="requirements" class="h-full m-0">
        <div class="flex flex-row w-full h-full">
            <div class="w-full border-r h-full {sidebarOpen ? 'lg:w-2/3' : 'lg:w-full'}">
                <div class="flex flex-row items-center gap-2 py-4 pl-4 ">
                    <Label for="view-selector">Document View</Label>
                    <Switch id="view-selector"/>
                    <Label for="view-selector">Table View</Label>
                </div>
                <ScrollArea class=" bg-sidebar border-t border-b px-4 py-2 h-[calc(100vh-14.25rem)] lg:h-[calc(100vh-11.25rem)]">
                    {#if data.data_test.standard.length>0}
                        <div class="w-full flex py-3 justify-end items-center">
                            <Switch bind:checked={edit_structure}></Switch>
                            <Label class="pl-2">Edit Document Structure</Label>
                        </div>
                    {/if}
                    {#if data.data_test.standard.length==0}
                    <div class="flex flex-row justify-center">
                        <Button size="lg">
                            <ListPlus></ListPlus>
                            <span>Click to Add Section</span>
                        </Button>
                    </div>
                    {:else}
                        <Accordion.Root type="multiple" value={defaultOpen} class="bg-background border p-4 pb-0">
                            <DocStructure structure={data.data_test.standard} edit={edit_structure} level={1}/>
                        </Accordion.Root>    
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
    <Tabs.Content value="traceability">
        Traceability
    </Tabs.Content>
</Tabs.Root>
