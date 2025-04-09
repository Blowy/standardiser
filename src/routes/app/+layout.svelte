<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index';
	import { Input } from '$lib/components/ui/input/index';
	import {Button} from '$lib/components/ui/button/index';
	import {Toaster} from '$lib/components/ui/sonner/index';
	import {toast} from 'svelte-sonner';
	import {Share, Search, Sun, Moon} from "lucide-svelte";
	import {page} from "$app/state"
	import {toggleMode} from 'mode-watcher';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>
<Toaster></Toaster>
<Sidebar.Provider>
	<AppSidebar user={data.user} standards={data.standards} />
	<div class="flex w-full flex-col">
		<header class="flex h-16 w-full flex-row items-center border-b bg-sidebar">
			<div class="h-16 border-r p-4">
				<Sidebar.Trigger></Sidebar.Trigger>
			</div>
			<div class="flex w-full flex-row items-center justify-between p-4">
				<div>
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item>
								<Breadcrumb.Link href="/app">
									Home
								</Breadcrumb.Link>
							</Breadcrumb.Item>
							{#if page.url.pathname === "/app/standards"}
								<Breadcrumb.Separator/>
								<Breadcrumb.Item>
									Standards
								</Breadcrumb.Item>
							{/if}
							{#if page.route.id === "/app/standards/[slug]"}
								<Breadcrumb.Separator/>
								<Breadcrumb.Item>
									<Breadcrumb.Link href="/app/standards">
										Standards
									</Breadcrumb.Link>
								</Breadcrumb.Item>
								<Breadcrumb.Separator/>
								<Breadcrumb.Item>
									<Breadcrumb.Link class="truncate max-w-[140px] lg:max-w-full">
										{#each data.standards as standard (standard.id)}
											{#if standard.id === Number(page.params.slug)}
												{standard.title}
											{/if}
										{/each}
									</Breadcrumb.Link>
								</Breadcrumb.Item>
							{/if}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</div>
				<div class="flex flex-row items-center gap-1">
					<Button class="flex lg:hidden" variant="outline" size="icon">
						<Search />
					</Button>
					<Button class="flex lg:hidden"
						onclick={()=>{
							navigator.clipboard.writeText(page.url.toString())
							toast.success("URL Copied to Clipboard",{
								description: page.url.toString()
							})
						}}
						variant="outline"
						size="icon"
					>
						<Share />
					</Button>
					<Input placeholder="Search" class="hidden lg:block bg-background" />
					<Button class="hidden lg:flex"
						onclick={()=>{
							navigator.clipboard.writeText(page.url.toString())
							toast.success("URL Copied to Clipboard",{
								description: page.url.toString()
							})
						}}
						variant="outline"
					>
						<Share />
						<span>Share</span>
					</Button>
					<Button variant="outline" size="icon" href="https://app.nocodb.com/#/base/b492027e-d62e-442a-b061-5ac9f268346d">
						<img src="/noco_icon.png" alt="nocodb logo" class="lg:w-8 mx-4 p-1" />
						<span class="sr-only">View on NocoDB</span>
					</Button>
					<Button onclick={toggleMode} variant="outline" size="icon" class="p-3">
						<Sun
						  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
						/>
						<Moon
						  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
						/>
						<span class="sr-only">Toggle theme</span>
					</Button>
						
				</div>
			</div>
		</header>
		<main class="flex-grow">
			{@render children()}
		</main>
	</div>
</Sidebar.Provider>
