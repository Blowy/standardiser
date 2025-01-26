<script lang="ts">
    import * as Select from "$lib/components/ui/select/index";

    type Values = {value:string, label:string}[];
    type SingleProps = {name:string, select_value:string|undefined, disabled:boolean, select_type:"single", values:Values, placeholder:string};
    type MultipleProps = {name:string, select_value:string[]|undefined, disabled:boolean, select_type:"multiple", values:Values, placeholder:string};
    type SelectProps = SingleProps|MultipleProps;

    let {name, select_value=$bindable(), disabled=$bindable(), select_type, values, placeholder}:SelectProps = $props();
    
    const trigger_value = $derived.by(()=>{
        if(select_type == "single"){
            let trigger_string = values.find((v)=>v.value == select_value)?.label ?? placeholder
            console.log(trigger_string)
            return trigger_string
        }
        else{
            if(!Array.isArray(select_value)){
                select_value = []
            }
            let trigger_string = select_value.map((v)=>values.find((val)=>val.value == v)?.label).join(", ") ?? placeholder
            console.log(trigger_string)
            return trigger_string
        }
    })
</script>


<div class="flex flex-col gap-2">
    {#if typeof select_value == "string" || typeof select_value == "undefined"}
        <Select.Root disabled={disabled} type="single" bind:value={select_value}>
            <Select.Trigger>
                {trigger_value}
            </Select.Trigger>
            <Select.Content>
                {#each values as value}
                    <Select.Item value={value.value} label={value.label}/>
                {/each}
            </Select.Content>
        </Select.Root>
    {:else if Array.isArray(select_value) || typeof select_value == "undefined" }
        <Select.Root disabled={disabled} type="multiple" bind:value={select_value}>
            <Select.Trigger>
                {trigger_value}
            </Select.Trigger>
            <Select.Content>
                {#each values as value}
                    <Select.Item value={value.value} label={value.label}/>
                {/each}
            </Select.Content>
        </Select.Root>
    {/if}
</div>