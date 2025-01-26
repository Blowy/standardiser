<script lang="ts">
    import { createUploader } from "$lib/utils/uploadthing";
  
    import { Uploader } from "@uploadthing/svelte";
  
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
  
  <main>
    <Uploader {uploader} />
  </main>
  