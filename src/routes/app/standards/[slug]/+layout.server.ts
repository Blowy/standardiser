import type { LayoutServerLoad } from './$types';
import {error} from "@sveltejs/kit"

export const load = (async (event) => {
    const standardId = parseInt(event.params.slug)
    console.log("Standard ID:")
    console.log(standardId)
    if (isNaN(standardId))
    {
        error(404, "Invalid standard ID")
    }
    console.log("Event Parent:")
    console.log(await event.parent())
    const selectedStandard = (await event.parent()).standards.find((standard) => standard.id == standardId)
    console.log("Selected Standard:")
    console.log(selectedStandard)
    if (!selectedStandard)
    {
        error(404, "Standard not found")
    }
    
    return {selectedStandard, standardId};
}) satisfies LayoutServerLoad;