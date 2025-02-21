import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    let content = (await event.parent()).selectedStandard?.content
    if (!content)
    {
        content = []
    }

    return {content};
}) satisfies PageServerLoad;