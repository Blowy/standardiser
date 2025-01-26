<script>
    import {Button} from "$lib/components/ui/button/index";
    import {DoorOpen} from "lucide-svelte"
</script>
<div class="flex flex-col items-center justify-center mt-20">
    <div class="flex flex-col justify-start gap-4"> 
        <div class="flex flex-row gap-4">
            <img src="/favicon.png" alt="Standardiser Logo" class="w-8 h-8" />
            <h1 class="text-2xl font-bold">Welcome to Standardiser</h1>
        </div>
        <p class="text-sm text-muted-foreground font-semibold">Placeholder Auth Page</p>
        <Button href="/app">
            <DoorOpen/>
            <span>Proceed to App</span>
        </Button>
    </div>  
</div>  