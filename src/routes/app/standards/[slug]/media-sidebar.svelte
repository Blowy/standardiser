<script lang="ts">
    import {Button} from '$lib/components/ui/button/index';
    import {Input} from '$lib/components/ui/input/index'
    import {Label} from '$lib/components/ui/label/index'
    import {Save, UploadCloud,ImageMinus} from "lucide-svelte";
	import { onMount } from 'svelte';
    import {enhance} from "$app/forms"
  
    let {id} = $props()
    let med:{id:number, url:string, caption:string}|undefined = $state(undefined)

    onMount(async () =>{
        const response = await fetch(`/api/media?id=${id}`);
        med = await response.json();
    })
    async function deleteMedia(id:number):Promise<void>{
            await fetch(`/api/media?id=${id}`, {
            method: 'DELETE'
        });
    }
</script>

<div class="flex flex-col gap-4 p-4">
    {#if med}
        <form method="post" class="flex flex-col gap-4 items-center" action="/app/standards?/update-media" use:enhance>
            <input type="hidden" name="image-edit-id" id="image-edit-id" bind:value={med.id}/>
            <input type="hidden" name="image-edit-url" id="image-edit-url" bind:value={med.url}/>
            {#if med.url != null && med.url != ''}
                <div class="border rounded-lg w-full flex flex-row justify-between p-4 gap-4">
                    <img src={med.url} alt="media" class=""/>
                    <Button size="icon" variant="outline" onclick={()=>{if(med){med.url = ''}}}>
                        <ImageMinus/>  
                    </Button>
                </div>
            {:else}
                <div class="w-full flex flex-col gap-2">
                    <Label for="image-file-input">
                        Upload Image
                    </Label>
                    <Input id="image-file-input" name="image-file-input" type="file"/>
                </div>
            {/if}
            <div class="w-full">
                <Label for="image-caption-input">
                    Caption
                </Label>
                <Input type="text" id="image-caption-input" name="image-caption-input" bind:value={med.caption}/>    
            </div>
            <div class="w-full flex flex-row justify-end">
                <Button type="submit" variant="default">
                    <Save/>
                    Save Changes
                </Button>
            </div>
        </form>
    {:else}
        <p>Loading...</p>
    {/if}
</div>