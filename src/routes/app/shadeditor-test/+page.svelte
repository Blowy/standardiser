<script lang="ts">
	import ShadEditorStandardiser from '$lib/components/shad-editor/shad-editor-standardiser.svelte';
	import { writable } from 'svelte/store';
	import { type JSONContent } from '@tiptap/core';
    import { onMount } from 'svelte';
    import {Button} from '$lib/components/ui/button/index';

    let content = $state("")
    
    $inspect(content)
    let output = $derived.by(()=>{
        return JSON.stringify(content)
    })

</script>
<main class="flex flex-col gap-4 p-4">
	<ShadEditorStandardiser class="h-[40rem]" bind:content={content}  />
    <p>{output}</p>
</main>