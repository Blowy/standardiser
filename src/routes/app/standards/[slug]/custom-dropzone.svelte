<script lang='ts'>
    import {Button} from '$lib/components/ui/button/index';
    import {Save, UploadCloud} from "lucide-svelte";
    import { createUploader } from "$lib/utils/uploadthing";
    import { UploadDropzone } from "@uploadthing/svelte";
	import { onMount } from 'svelte';
    const uploader = createUploader("imageUploader", {
      onClientUploadComplete: (res) => {
        console.log(`onClientUploadComplete`, res);
        alert("Upload Completed");
      },
      onUploadError: (error: Error) => {
        alert(`ERROR! ${error.message}`);
      },
    });
</script>
<UploadDropzone {uploader} class="pt-4 pb-2">
    <i slot="upload-icon">
        <UploadCloud/>
    </i>
    <span slot="button-content" let:state class="text-black">
        {state.isUploading ? "Uploading..." : "Upload a file"}
    </span>
    <span slot="label" let:state class="text-muted-foreground">
        {state.ready ? "Ready to upload" : "Loading"}
    </span>
</UploadDropzone>