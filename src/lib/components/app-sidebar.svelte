<script lang="ts">
	import {page} from "$app/state"
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import * as Collapsible from '$lib/components/ui/collapsible/index';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import * as Avatar from '$lib/components/ui/avatar/index';
	import * as Dialog from "$lib/components/ui/dialog/index";
	import * as Select from "$lib/components/ui/select/index";
	import * as Alert from "$lib/components/ui/alert/index";
	import {Label} from '$lib/components/ui/label/index';
	import {Input} from '$lib/components/ui/input/index';
	import { Button } from '$lib/components/ui/button/index';
	import {enhance} from '$app/forms';
	import {
		Home,
		LibraryBig,
		Plus,
		ChevronDown,
		ChevronsUpDown,
		Settings,
		LogOut,
		Users,
		BookPlus,
		Unplug,
		Database,
		LoaderCircle,
		CircleSlash,
		UserCog,
		Link,
		BookA,
		BookCheck,
		BookText,
		Sheet,
		Ellipsis,
		Trash,
		Edit,
		TriangleAlert
	} from 'lucide-svelte';
	import {onMount} from 'svelte';
	import { goto } from "$app/navigation";


	let { user, standards } = $props();
	console.log(standards);

	let dbHeartbeat = $state("Checking")
	async function getHeartbeat(){
		const res = await fetch('/api/heartbeat');
		const data = await res.json();
		if (data.status === 'ok') {
			dbHeartbeat = "Connected";
		} else {
			dbHeartbeat = "Disconnected";
		}
	}
	onMount(() => {
		getHeartbeat();
		const interval = setInterval(getHeartbeat, 10000)
		return () => clearInterval(interval);
	});

	const status_list = [
		{value: "bronze", label: "Bronze"},
		{value: "silver", label: "Silver"},
		{value: "gold", label: "Gold"},
	]
	let status_value = $state("");

	let status_trigger_value = $derived(
		status_list.find((status)=>status.value === status_value)?.label ?? "Select Status"
	)
	let edit_title_static = $state("");
	let edit_title_value = $state("");
	let edit_doc_num_value = $state("");
	let edit_ver_value = $state("");
	let edit_status_value = $state("");
	let edit_form_value = $state("");

	let edit_status_trigger_value = $derived(
		status_list.find((status)=>status.value === edit_status_value)?.label ?? "Select Status"
	)

	let add_dialog_open = $state(false);


	let edit_dialog_open = $state(false);
	let delete_dialog_open = $state(false);
	let delete_form_value = $state("");
	let delete_title_value = $state("");
	let delete_input_value = $state("");
	let delete_form_validation = $derived(
		delete_input_value !== delete_title_value
	)
</script>

<Sidebar.Root>
	<Sidebar.Header class="flex h-16 justify-center border-b">
		<div class="flex flex-row items-center gap-2 pl-4">
			<img src="/favicon.png" alt="logo" class="w-6" />
			<h1 class="text-2xl font-bold">Standardiser</h1>
		</div>
	</Sidebar.Header>
	<Sidebar.Content class="">
		<Collapsible.Root open class="group/collapsible">
			<Sidebar.Group>
				<Sidebar.GroupLabel>
					{#snippet child({ props })}
						<Collapsible.Trigger {...props}>
							<span >Standards</span>
							<ChevronDown
								class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
							/>
						</Collapsible.Trigger>
					{/snippet}
				</Sidebar.GroupLabel>
				
					<Dialog.Root bind:open={add_dialog_open} on:close={()=>{add_dialog_open = false}}>
						<Dialog.Trigger>
							{#snippet child({props})}
								<Sidebar.GroupAction title="Add Standard" class="mr-6" {...props}>
										<Plus class="size-4"/><span class="sr-only">Add Standard</span>
								</Sidebar.GroupAction>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content>
							<form method="post" action="/app/standards?/add" use:enhance>
								<Dialog.Header>
									<Dialog.Title>Add Standard</Dialog.Title>
									<Dialog.Description>Enter Standard Title and an optional Excel input file in order to create a new standard.</Dialog.Description>
								</Dialog.Header>
								<div class="flex flex-col gap-4 py-4">
									<div class="flex flex-col gap-2">
										<Label for="modal-standard-title">
											Standard Title
										</Label>
										<Input type="text" name="modal-standard-title" id="modal-standard-title" placeholder="Title" />
									</div>
									<div class="flex flex-col gap-2">
										<Label for="modal-standard-doc-num">
											Document Number
										</Label>
										<Input type="text" name="modal-standard-doc-num" id="modal-standard-doc-num" placeholder="Document Number" />
									</div>
									<div class="flex flex-col gap-2">
										<Label for="modal-standard-status">
											Status
										</Label>
										<Select.Root type="single" name="modal-standard-status" bind:value={status_value}>
											<Select.Trigger>
												{status_trigger_value}
											</Select.Trigger>
											<Select.Content>
												{#each status_list as status}
													<Select.Item value={status.value} label={status.label}/>
												{/each}
											</Select.Content>
										</Select.Root>
									</div>
									<div class="flex flex-col gap-2">
										<Label for="modal-standard-ver">
											Version
										</Label>
										<Input type="text" name="modal-standard-ver" id="modal-standard-ver" placeholder="Version Number" />
									</div>
									<div class="flex flex-col gap-2">
										<Label for="modal-standard-file">
											Input Excel File <span class="text-xs text-muted-foreground">(Optional)</span>
										</Label>
										<Input type="file" name="modal-standard-file" id="modal-standard-file" disabled/>
										<span class="text-xs text-destructive">Excel file upload is not yet supported.</span>
									</div>
								</div>
								<Dialog.Footer>
									<Button type="submit" onclick={()=>{add_dialog_open = false}}>
										<BookPlus/>
										<span>Add Standard</span>
									</Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				<Collapsible.Content>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#await standards}
								<Sidebar.MenuItem>
									<Sidebar.SidebarMenuSkeleton></Sidebar.SidebarMenuSkeleton>
								</Sidebar.MenuItem>
							{:then standards} 
								{#if standards.length > 0}
									{#each standards as standard}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton size="sm" isActive={Number(page.params.slug) === standard.id} >
												{#snippet child({ props })}
													<a href={"/app/standards/"+standard.id} {...props}>
														<BookCheck class={standard.status == "gold" ? "text-yellow-600": standard.status == "silver" ? "text-gray-400" : "text-orange-700" }></BookCheck>
														<span>{standard.title}</span>
													</a>
												{/snippet}
											</Sidebar.MenuButton>
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													{#snippet child ({props})}
														<Sidebar.MenuAction {...props} class="text-muted-foreground">
															<Ellipsis/>
														</Sidebar.MenuAction>
													{/snippet}
												</DropdownMenu.Trigger>
												<DropdownMenu.Content>
													<DropdownMenu.Item onclick={()=>{
															edit_dialog_open = true
															edit_title_static = standard.title
															edit_status_value = standard.status
															edit_doc_num_value = standard.docNumber
															edit_title_value = standard.title
															edit_ver_value = standard.version
															edit_form_value	= standard.id
														}}>
														<Edit/>
														<span>Edit Project</span>
													</DropdownMenu.Item>
													<DropdownMenu.Item class="text-destructive" onclick={()=>{
															delete_dialog_open = true
															delete_form_value = standard.id
															delete_title_value = standard.title
													}}>
														<Trash></Trash>
														<span>Delete Project</span>
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</Sidebar.MenuItem>
									{/each}
								{:else}
									<div class="flex flex-row items-center pl-2 gap-2 text-xs py-1 text-destructive">
										<CircleSlash class="size-3"/>
										<span class="text-xs font-semibold">No standards found.</span>
									</div>
								{/if}
							{/await}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Collapsible.Content>
			</Sidebar.Group>
		</Collapsible.Root>
		<Collapsible.Root open class="group/collapsible">
			<Sidebar.Group>
				<Sidebar.GroupLabel>
					{#snippet child({ props })}
						<Collapsible.Trigger {...props}>
							<span class="">Traceability & Admin</span>
							<ChevronDown
								class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
							/>
						</Collapsible.Trigger>
					{/snippet}
				</Sidebar.GroupLabel>
				<Collapsible.Content>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton size="sm">
									<Sheet></Sheet>
									<span>Import SST Master</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton size="sm">
									<BookA></BookA>
									<span>Glossary</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
							<Collapsible.Root>
								<Collapsible.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuButton size="sm" {...props}>
											<LibraryBig></LibraryBig>
											Source Standards
										</Sidebar.MenuButton>
									{/snippet}
								</Collapsible.Trigger>
								<Collapsible.Content>
									<Sidebar.MenuSub>
										<Sidebar.MenuSubItem>
											<Sidebar.MenuButton size="sm">
												<BookText class="text-blue-600"></BookText>
												MTM A1551
											</Sidebar.MenuButton>
										</Sidebar.MenuSubItem>
										<Sidebar.MenuSubItem>
											
											<Sidebar.MenuButton size="sm">
												<BookText class="text-purple-600"></BookText>
												V/Line NIST12.1
											</Sidebar.MenuButton>
										</Sidebar.MenuSubItem>
										<Sidebar.MenuSubItem>
											
											<Sidebar.MenuButton size="sm">
												<BookText class="text-red-600"></BookText>
												RISSB AS7711
											</Sidebar.MenuButton>
										</Sidebar.MenuSubItem>
									</Sidebar.MenuSub>
								</Collapsible.Content>
							</Collapsible.Root>
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Collapsible.Content>
			</Sidebar.Group>
		</Collapsible.Root>
	</Sidebar.Content>
	<Sidebar.Footer class="border-t p-0">
		<Sidebar.Menu class="p-2 pb-0">
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props} variant="outline" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 p-2">
								<Avatar.Root>
									<Avatar.Image src="" alt={user.email} />
									<Avatar.Fallback class="border">{user.first_name.slice(0,1)}{user.last_name.slice(0,1)}</Avatar.Fallback>
								</Avatar.Root>
								<span>{user.email}</span>
								<ChevronsUpDown class="ml-auto"/>
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-[--bits-dropdown-menu-anchor-width]" side="top">
						<DropdownMenu.Item>
							<UserCog/>
							User Settings
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<Settings></Settings>
							Admin Settings
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<LogOut></LogOut>
							Log Out
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		{#if dbHeartbeat === "Checking"}
			<div class="bg-yellow-500 border-t text-white px-4 flex flex-row gap-2 items-center py-0.5">
				<LoaderCircle class="size-3 animate-spin"/>
				<span class="text-sm">Checking</span>
			</div>
		{:else if dbHeartbeat === "Disconnected"}
			<div class="bg-red-500 border-t text-white px-4 flex flex-row gap-2 items-center py-0.5">
				<Unplug class="size-3"/>
				<span class="text-sm">Disconnected</span>
			</div>
		{:else}
			<div class="bg-green-500 bg- border-t text-white px-4 flex flex-row gap-2 items-center py-0.5">
				<Database class="size-3"/>
				<span class="text-sm">Connected</span>
			</div>
		{/if}
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>

<Dialog.Root bind:open={edit_dialog_open} on:close={()=>{edit_dialog_open = false}}>
	<Dialog.Content>
		<form method="post" action="/app/standards?/edit" use:enhance>
			<input type="hidden" name="modal-edit-id" bind:value={edit_form_value}/>
			<Dialog.Header>
				<Dialog.Title>Edit {edit_title_static} Metadata</Dialog.Title>
				<Dialog.Description>Update information such as Title, Version, and Status.</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-4 py-4">
				<div class="flex flex-col gap-2">
					<Label for="modal-edit-title">
						Standard Title
					</Label>
					<Input type="text" name="modal-edit-title" id="modal-edit-title" placeholder="Title" bind:value={edit_title_value} />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="modal-edit-doc-num">
						Document Number
					</Label>
					<Input type="text" name="modal-edit-doc-num" id="modal-edit-doc-num" placeholder="Document Number" bind:value={edit_doc_num_value}/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="modal-edit-status">
						Status
					</Label>
					<Select.Root type="single" name="modal-edit-status" bind:value={edit_status_value}>
						<Select.Trigger>
							{edit_status_trigger_value}
						</Select.Trigger>
						<Select.Content>
							{#each status_list as status}
								<Select.Item value={status.value} label={status.label}/>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="modal-edit-ver">
						Version
					</Label>
					<Input type="text" name="modal-edit-ver" id="modal-edit-ver" placeholder="Version Number" bind:value={edit_ver_value} />
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="default" type="submit" onclick={()=>{edit_dialog_open = false}}>Save Changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>



<Dialog.Root bind:open={delete_dialog_open} on:close={()=>{delete_dialog_open = false}}>
	<Dialog.Content>
		<form method="post" action="/app/standards?/delete" use:enhance>
			<input type="hidden" name="modal-delete-id" bind:value={delete_form_value}/>
			<Dialog.Header>
				<Dialog.Title>Delete {delete_title_value}?</Dialog.Title>
				<Alert.Root variant="destructive">
					<TriangleAlert class="size-4"/>
					<Alert.Title>Are you sure?</Alert.Title>
					<Alert.Description>Deleting a standard is permanent and will lead to data loss.</Alert.Description>
				</Alert.Root>
			</Dialog.Header>
			<div class="flex flex-col gap-4 py-4">
				<p>To proceed, please enter <span class="font-bold text-destructive">{delete_title_value}</span> below:</p>
				<div class="flex flex-col gap-2">
					<Label for="modal-delete-title">
						Confirmation
					</Label>
					<Input type="text" name="modal-delete-title" id="modal-delete-title" placeholder="Title" bind:value={delete_input_value} />
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="destructive" type="submit" disabled={delete_form_validation} onclick={()=>{
					console.log(delete_form_value)
					console.log(page.params.slug)
					if (delete_form_value == page.params.slug){
						goto("/app/standards")
						delete_dialog_open = false
					}
					else{
						delete_dialog_open = false
					}
				}}>Delete Standard</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
