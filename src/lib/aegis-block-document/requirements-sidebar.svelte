<script lang="ts">
    import {Label} from "$lib/components/ui/label/index";
    import {Separator} from "$lib/components/ui/separator/index";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index"; 
    import * as Accordion from "$lib/components/ui/accordion/index";
    import {CirclePlay, Trash, FolderDown, FileDown, Edit, FileUp, ListPlus, ListX, MoveUp, MoveDown,Eye,Save, Ellipsis, CircleHelp, PencilRuler} from "lucide-svelte";
    import {Button} from '$lib/components/ui/button/index';
    import {Input} from '$lib/components/ui/input/index';
    import {Textarea} from '$lib/components/ui/textarea/index';
    import { Checkbox } from "$lib/components/ui/checkbox/index"
    import * as Select from "$lib/components/ui/select/index";
    import * as Card from "$lib/components/ui/card/index";
    import * as Alert from "$lib/components/ui/alert/index"

    import * as Popover from "$lib/components/ui/popover/index"

    let {id} = $props();

    let ears_items = [
        {value:"if", label:"If"},
        {value:"while", label:"While"},
        {value:"when", label:"When"},
        {value:"where", label:"Where"},
    ];

    let requirement_blocks:{type:string,condition:string}[] = $state([])
    let system_response = $state('')
    let system_name = $state('')
    let risk_contexts:{context:string, problem:string, solution:string,evidence?:string, commentary?:string}[] = $state([{context:"", problem:"", solution:"", evidence:"", commentary:""}])
    let guidelines:{state_of_art:string, prior_art:string, commentary:string}[] = $state([{state_of_art:"", prior_art:"", commentary:""}])
    
    function addBlock(){
        requirement_blocks = [...requirement_blocks, {type:"", condition:""}];
    }

    function addRisk()
    {
        risk_contexts = [...risk_contexts, {context:"", problem:"", solution:"", evidence:"", commentary:""}];
    }

    function addGuideline(){
        guidelines = [...guidelines, {state_of_art:"", prior_art:"", commentary:""}];
    }

    function removeBlock(index:number){
        requirement_blocks = requirement_blocks.filter((block, i)=>i !== index);
    }

    function removeRisk(index:number){
        risk_contexts = risk_contexts.filter((block, i)=>i !== index);
    }

    function removeGuideline(index:number){
        guidelines = guidelines.filter((block, i)=>i !== index);
    }

    function moveBlockUp(index:number){
        if (index > 0){
            let temp = requirement_blocks[index];
            requirement_blocks[index] = requirement_blocks[index-1];
            requirement_blocks[index-1] = temp;
        }
    }
    function moveRiskUp(index:number){
        if (index > 0){
            let temp = risk_contexts[index];
            risk_contexts[index] = risk_contexts[index-1];
            risk_contexts[index-1] = temp;
        }
    }

    function moveGuidelineUp(index:number){
        if (index > 0){
            let temp = guidelines[index];
            guidelines[index] = guidelines[index-1];
            guidelines[index-1] = temp;
        }
    }
    function moveBlockDown(index:number){
        if (index < requirement_blocks.length - 1){
            let temp = requirement_blocks[index];
            requirement_blocks[index] = requirement_blocks[index+1];
            requirement_blocks[index+1] = temp;
        }
    }

    function moveRiskDown(index:number){
        if (index < risk_contexts.length - 1){
            let temp = risk_contexts[index];
            risk_contexts[index] = risk_contexts[index+1];
            risk_contexts[index+1] = temp;
        }
    }

    function moveGuidelineDown(index:number){
        if (index < guidelines.length - 1){
            let temp = guidelines[index];
            guidelines[index] = guidelines[index+1];
            guidelines[index+1] = temp;
        }
    }

    let input_reasonable = $derived.by(()=>{
        return requirement_blocks.length > 0 && system_name && system_response;
    })

    let risk_input_reasonable = $derived.by(() => {
        if (risk_contexts.length === 0) return false;
        
        return risk_contexts.every((risk_context) => {
            return risk_context.context.length > 1 && 
                risk_context.problem.length > 1 && 
                risk_context.solution.length > 1;
        });
    });

    let guidance_input_reasonable = $derived.by(() => {
        if (guidelines.length === 0) return false;
        
        return guidelines.every((guideline) => {
            return guideline.state_of_art.length > 1
        });
    });

    let preview_string = $derived.by(() => {
        const conditions = requirement_blocks
            .map((block,i) => {
                let type = block.type;
                let condition = block.condition;
                if (i == 0){
                    type = type.charAt(0).toUpperCase() + type.slice(1);
                }
                return `${type} ${condition}`;
            }).filter(part => part.trim() !== ' ')
            .join(', ');
        
        let systemPart = ''
        if (requirement_blocks.length == 0){
            systemPart = system_name ? `The ${system_name} ` : '';
        }
        else{
            systemPart = system_name ? `, the ${system_name} ` : '';
        }
        const responsePart = system_response ? `shall ${system_response}.` : '';
        
        return [conditions, systemPart, responsePart]
            .filter(part => part).join('');
    });

    let risk_preview_string:string = $derived.by(()=>{
        const risk_string = risk_contexts.map((risk_context,i)=>{
            const parts = [
                risk_context.context && `${risk_context.context}`,
                risk_context.problem && `${risk_context.problem}`,
                risk_context.solution && `${risk_context.solution}`,
                risk_context.evidence && `${risk_context.evidence}`,
                risk_context.commentary && `${risk_context.commentary}`
            ].filter(Boolean).join('\r');
            return parts;
        }).join('\r\r');
        return risk_string
    })

    let guidance_preview_string:string = $derived.by(()=>{
        const guidance_string = guidelines.map((guideline,i)=>{
            const parts = [
                guideline.state_of_art && `${guideline.state_of_art}`,
                guideline.prior_art && `${guideline.prior_art}`,
                guideline.commentary && `${guideline.commentary}`,
            ].filter(Boolean).join('\r');
            return parts;
        }).join('\r\r');
        return guidance_string
    })

    const vv_methods = [
        {value:"test", label:"Test"},
        {value:"demonstrate", label:"Demonstration"},
        {value:"analysis", label:"Analysis"},
        {value:"inspect", label:"Inspection"},
        {value:"cert", label:"Certification"},
    ]

    let selected_method = $state<string[]>([]);

    let vv_trigger_content = $derived.by(() => {
        if (selected_method.length === 0){
            return "Select V&V Methods";
        } 
        else{
            return selected_method.map((method) => vv_methods.find((m) => m.value === method)?.label).join(', ')
        }
        
    });

    const internal_interfaces = [
        {label:"Interlocking", value:"interlocking"},
        {label:"Points & Other Moveable Infrastructure", value:"points"},
        {label:"Signals & Signage", value:"signals"},
        {label:"Railway Crossings", value:"crossings"},
        {label:"Train Detection", value:"detection"},
        {label:"Train Protection", value:"protection"},
        {label:"Signalling Control & Indication", value:"control"},
        {label:"Signalling Communication", value:"communication"},
        {label:"Signalling Power", value:"power"},
        {label:"Maintenance & Diagnostic Facilities", value:"maintenance"},
    ]

    const external_interfaces = [
        {label: "Cable Route", value: "cable_route"},
        {label: "Rail Power", value: "rail_power"},
        {label: "External Communications Networks", value: "external_communications_networks"},
        {label: "Local Street Power Supply", value: "local_street_power_supply"},
        {label: "OMS", value: "oms"},
        {label: "Other Transport Systems", value: "other_transport_systems"},
        {label: "Road Traffic Management", value: "road_traffic_management"},
        {label: "Track and Civils", value: "track_and_civils"},
        {label: "Rolling Stock", value: "rolling_stock"},
        {label: "Structures", value: "structures"}
    ]

    let selected_interfaces = $state<string[]>([]);

    let interfaces_trigger_content = $derived.by(() => {
        if (selected_interfaces.length === 0){
            return "Select Internal or External Interfaces";
        } 
        else{
            return selected_interfaces.map((method) => {
                const internal = internal_interfaces.find((i) => i.value === method)?.label;
                const external = external_interfaces.find((i) => i.value === method)?.label;
                return internal || external;
            }).filter(Boolean).join(', ')
        }
    });
</script>

<Accordion.Root type="multiple">
    <Accordion.Item>
        <Accordion.Trigger class="p-4">Requirement Text</Accordion.Trigger>
        <Accordion.Content class="p-4">
            <div class="flex flex-col gap-2">
                {#if requirement_blocks.length > 0}
                    <div class="flex flex-col gap-2">
                        {#each requirement_blocks as block, i}
                            <div class="flex flex-row gap-2">
                                <Card.Root class="w-full">
                                    <Card.Content class="flex flex-row items-center gap-2">
                                        <Select.Root type="single" name="ears-item" bind:value={block.type}>
                                            <Select.Trigger class="w-min">
                                                {ears_items.find((item)=>item.value === block.type)?.label ?? "Select EARS Component"}
                                            </Select.Trigger>
                                            <Select.Content>
                                                <Select.Item value="if" label="If"/>
                                                <Select.Item value="while" label="While"/>
                                                <Select.Item value="when" label="When"/>
                                                <Select.Item value="where" label="Where"/>
                                            </Select.Content>
                                        </Select.Root>
                                        <Input type="text" class="" placeholder="Condition" bind:value={block.condition}/>
                                    </Card.Content>
                                </Card.Root>
                                <DropdownMenu.Root >
                                    <DropdownMenu.Trigger class="inline-block md:hidden">
                                        <span class="sr-only">Open options</span>
                                        <Button variant="outline" size="icon"><Ellipsis></Ellipsis></Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content>
                                        <DropdownMenu.Item onclick={addBlock} >Add EARS Condition</DropdownMenu.Item>
                                        <DropdownMenu.Item onclick={()=>moveBlockUp(i)} disabled={i == 0}>Move Up</DropdownMenu.Item>
                                        <DropdownMenu.Item onclick={()=>moveBlockDown(i)} disabled={i >= requirement_blocks.length - 1}>Move Down</DropdownMenu.Item>
                                        <DropdownMenu.Item onclick={()=>removeBlock(i)}>Remove</DropdownMenu.Item>
                                    </DropdownMenu.Content> 
                                </DropdownMenu.Root>
                                <div class="gap-2 items-center hidden md:flex">
                                    <Button variant="outline" size="icon" onclick={addBlock}><ListPlus/></Button>
                                    <Button variant="outline" size="icon" disabled={i == 0} onclick={()=>moveBlockUp(i)}><MoveUp/></Button>
                                    <Button variant="outline" size="icon" disabled={i >= requirement_blocks.length - 1} onclick={()=>moveBlockDown(i)}><MoveDown/></Button>
                                    <Button variant="destructive" size="icon" onclick={()=>removeBlock(i)}><ListX/></Button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <Button class="w-min" variant="outline" onclick={addBlock}><ListPlus/>Add EARS Condition</Button>
                {/if}
                <Card.Root class="w-full">
                    <Card.Content class="flex flex-row items-center gap-2">
                        {#if requirement_blocks.length > 0}
                            <span>the</span>
                        {:else}
                            <span>The</span>
                        {/if}
                        <Input type="text" placeholder="System Name" bind:value={system_name}/>
                        <span>shall</span>
                        <Input type="text" placeholder="System Response" bind:value={system_response}/>
                    </Card.Content>
                </Card.Root>
                {#if preview_string.length > 1}
                    <Alert.Root class="w-full">
                        <Eye class="size-4"></Eye>
                        <Alert.Title>Requirement Text Preview</Alert.Title>
                        <Alert.Description>
                            <p>{preview_string}</p>
                        </Alert.Description>
                    </Alert.Root>
                {/if}
                <div class="w-full flex flex-row justify-end">
                    <Button type="submit" class="w-full lg:w-1/3" disabled={!input_reasonable}><Save></Save>Save Changes</Button>
                </div>
            </div>    
        </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item>
        <Accordion.Trigger class="p-4">
            Rationale Text
        </Accordion.Trigger>
        <Accordion.Content class="p-4">
            <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2">
                    {#each risk_contexts as risk_context, i}
                        <div class="flex flex-row gap-2 items-start">
                            <Card.Root class="w-full">
                                <Card.Content class="flex flex-col items-start gap-2">
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"context"+i}>Context and Scope</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Context & Scope</p>
                                                    <p >The underlying scope for the risk that this requirement responds to. This may include:</p>
                                                    <ul class="list-disc list-inside">
                                                        <li>Location</li>
                                                        <li>Actors</li>
                                                        <li>Systems</li>
                                                        <li>Events</li>
                                                        <li>Sequence</li>
                                                    </ul>
                                                    <p class="text-red-500 font-bold text-right">* Required</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="Context and scope" id={"context"+i} bind:value={risk_context.context}/>
                                    </div>
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"problem"+i}>Problem Statement</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Problem Statement</p>
                                                    <p>A discussion of the hazard or consequence that the requirement mitigates. This may include:</p>
                                                    <ul class="list-disc list-inside">
                                                        <li>Known risks</li>
                                                        <li>"Gotchas"</li>
                                                        <li>Compounding Effects</li>
                                                    </ul>
                                                    <p class="text-red-500 font-bold text-right">* Required</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="Problem, hazard or consequence" id={"context"+i} bind:value={risk_context.problem}/>
                                    </div>
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"solution"+i}>Solution</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Solution</p>
                                                    <p>An outline of how the requirement is a solution for, or minimises the associated problem statement.</p>
                                                    <p class="text-red-500 font-bold text-right">* Required</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="Solution" id={"solution"+i} bind:value={risk_context.solution}/>
                                    </div>
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"evidence"+i}>Evidence</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Evidence</p>
                                                    <p>Any evidence that gives credibility to the claim that the requirement manages the risk appropriately. Could include:</p>
                                                    <ul class="list-disc list-inside">
                                                        <li>Calculations</li>
                                                        <li>Statistics</li>
                                                        <li>Studies</li>
                                                    </ul>
                                                    <p class="text-blue-400 font-bold text-right">* Optional</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        
                                        <Textarea class="" placeholder="Evidence" id={"evidence"+i} bind:value={risk_context.evidence}/>
                                    </div>
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"commentary"+i}>Commentary</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Commentary</p>
                                                    <p>Any additional discussion, including:</p>
                                                    <ul class="list-disc list-inside">
                                                        <li>Good Practice</li>
                                                        <li>Interoperability</li>
                                                        <li>Complexity Management</li>
                                                        <li>Value for Money</li>
                                                        <li>Alignment to State Strategy</li>
                                                        <li>Stakeholder Needs</li>
                                                    </ul>
                                                    <p class="text-blue-400 font-bold text-right">* Optional</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="Commentary" id={"commentary"+i} bind:value={risk_context.commentary}/>
                                    </div>
                                </Card.Content>
                            </Card.Root>
                            <DropdownMenu.Root >
                                <DropdownMenu.Trigger class="inline-block md:hidden">
                                    <span class="sr-only">Open options</span>
                                    <Button variant="outline" size="icon"><Ellipsis></Ellipsis></Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    <DropdownMenu.Item onclick={addRisk}>Add Risk</DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={()=>moveRiskUp(i)} disabled={i == 0}>Move Up</DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={()=>moveRiskDown(i)} disabled={i >= risk_contexts.length - 1}>Move Down</DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={()=>removeRisk(i)} disabled={risk_contexts.length == 1}>Remove</DropdownMenu.Item>
                                </DropdownMenu.Content> 
                            </DropdownMenu.Root>
                            <div class="gap-2 items-center hidden md:flex flex-col">
                                <Button variant="outline" size="icon" onclick={addRisk}><ListPlus/></Button>
                                <Button variant="outline" size="icon" disabled={i == 0} onclick={()=>moveRiskUp(i)}><MoveUp/></Button>
                                <Button variant="outline" size="icon" disabled={i >= risk_contexts.length - 1} onclick={()=>moveRiskDown(i)}><MoveDown/></Button>
                                <Button variant="destructive" size="icon" onclick={()=>removeRisk(i)} disabled={risk_contexts.length == 1}><ListX/></Button>
                            </div>
                        </div>
                    {/each}
                </div>
                    {#if risk_preview_string.length > 1}
                        <Alert.Root class="w-full">
                            <Eye class="size-4"></Eye>
                            <Alert.Title>Rationale Text Preview</Alert.Title>
                            <Alert.Description>
                                {@html risk_preview_string.replace(/\r|\n/g, "<br />")}
                            </Alert.Description>
                        </Alert.Root>
                    {/if}
                <div class="w-full flex flex-row justify-end">
                    <Button type="submit" class="w-full lg:w-1/3" disabled={!risk_input_reasonable}><Save></Save>Save Changes</Button>
                </div>
            </div>    
        </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item>
        <Accordion.Trigger class="p-4">
            Guidance Text
        </Accordion.Trigger>
        <Accordion.Content class="p-4">
            <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2">
                    {#each guidelines as guideline, i}
                        <div class="flex flex-row gap-2 items-start">
                            <Card.Root class="w-full">
                                <Card.Content class="flex flex-col items-start gap-2">
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"soa"+i}>State of the Art</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">State of the Art</p>
                                                    <p >Outline the current best practice implementation or approach to achieving this requirement.</p>
                                                    <p class="text-red-500 font-bold text-right">* Required</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="State of the Art" id={"soa"+i} bind:value={guideline.state_of_art}/>
                                    </div>
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"prior_art"+i}>Prior Art</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Prior Art</p>
                                                    <p>Discuss ways this requirement may have been satisfied in the past. This may include reference points for readers based on their previous experience.</p>
                                                    <p class="text-blue-400 font-bold text-right">* Optional</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="Prior Art" id={"prior_art"+i} bind:value={guideline.prior_art}/>
                                    </div>
                                    <div class="w-full flex flex-col gap-2">
                                        <div class="flex flex-row gap-2 items-center">
                                            <Label for={"solution"+i}>Commentary</Label>
                                            <Popover.Root>
                                                <Popover.Trigger>
                                                    <Button variant="ghost" size="icon" class="rounded-full p-0"><CircleHelp></CircleHelp></Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="text-sm text-muted-foreground">
                                                    <p class="font-bold ">Commentary</p>
                                                    <p>Any additional supporting information required to support the guidance, including terms & definitions, calculations or defined figures.</p>
                                                    <p class="text-blue-400 font-bold text-right">* Optional</p>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <Textarea class="" placeholder="Commentary" id={"commentary"+i} bind:value={guideline.commentary}/>
                                    </div>

                                </Card.Content>
                            </Card.Root>
                            <DropdownMenu.Root >
                                <DropdownMenu.Trigger class="inline-block md:hidden">
                                    <span class="sr-only">Open options</span>
                                    <Button variant="outline" size="icon"><Ellipsis></Ellipsis></Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    <DropdownMenu.Item onclick={addGuideline}>Add Risk</DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={()=>moveGuidelineUp(i)} disabled={i == 0}>Move Up</DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={()=>moveGuidelineDown(i)} disabled={i >= guidelines.length - 1}>Move Down</DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={()=>removeGuideline(i)} disabled={guidelines.length == 1}>Remove</DropdownMenu.Item>
                                </DropdownMenu.Content> 
                            </DropdownMenu.Root>
                            <div class="gap-2 items-center hidden md:flex flex-col">
                                <Button variant="outline" size="icon" onclick={addGuideline}><ListPlus/></Button>
                                <Button variant="outline" size="icon" disabled={i == 0} onclick={()=>moveGuidelineUp(i)}><MoveUp/></Button>
                                <Button variant="outline" size="icon" disabled={i >= guidelines.length - 1} onclick={()=>moveGuidelineDown(i)}><MoveDown/></Button>
                                <Button variant="destructive" size="icon" onclick={()=>removeGuideline(i)} disabled={guidelines.length == 1}><ListX/></Button>
                            </div>
                        </div>
                    {/each}
                </div>
                    {#if guidance_preview_string.length > 1}
                        <Alert.Root class="w-full">
                            <Eye class="size-4"></Eye>
                            <Alert.Title>Guidance Text Preview</Alert.Title>
                            <Alert.Description>
                                {@html guidance_preview_string.replace(/\r|\n/g, "<br />")}
                            </Alert.Description>
                        </Alert.Root>
                    {/if}
                <div class="w-full flex flex-row justify-end">
                    <Button type="submit" class="w-full lg:w-1/3" disabled={!guidance_input_reasonable}><Save></Save>Save Changes</Button>
                </div>
            </div>    
        </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item>
        <Accordion.Trigger class="p-4">
            Other Details
        </Accordion.Trigger>
        <Accordion.Content class="p-4">
            <div class="flex flex-col gap-2">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>V&V Method</Card.Title>
                        <Card.Description>What methods will be used to verify and validate this requirement?</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <Label>Select applicable V&V methods</Label>
                        <Select.Root type="multiple" name="vv-methods" bind:value={selected_method}>
                            <Select.Trigger>
                                {vv_trigger_content}
                            </Select.Trigger>
                            <Select.Content>
                                {#each vv_methods as method}
                                    <Select.Item value={method.value} label={method.label}/>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Legacy Requirement</Card.Title>
                        <Card.Description>Has this requirement been developed in order to satisfy the needs of legacy signalling system implementations?</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="flex flex-row gap-2 items-center">
                            <Label for="legacy">Legacy</Label>
                            <Checkbox id="legacy"/>
                        </div>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Interface</Card.Title>
                        <Card.Description>Does this requirement have impacts on any internal or external interfaces?</Card.Description>
                    </Card.Header>
                    <Card.Content class="flex flex-col gap-4">
                        <Label>Select applicable Extenral or Internal Interfaces</Label>
                        <Select.Root type="multiple" name="interfaces" bind:value={selected_interfaces}>
                            <Select.Trigger>
                                {interfaces_trigger_content}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    <Select.GroupHeading>Internal Interfaces</Select.GroupHeading>
                                    <Separator/>
                                    {#each internal_interfaces as i}
                                        <Select.Item value={i.value} label={i.label}/>
                                    {/each}
                                </Select.Group>
                                <Select.Group>
                                    <Separator/>
                                    <Select.GroupHeading>External Interfaces</Select.GroupHeading>
                                    <Separator/>
                                    {#each external_interfaces as i}
                                        <Select.Item value={i.value} label={i.label}/>
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    </Card.Content>
                </Card.Root>
            </div>
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>