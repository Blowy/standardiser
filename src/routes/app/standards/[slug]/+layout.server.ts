import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
    const parent_data = await event.parent()
    const page_standard = parent_data.standards.find((standard) => standard.id == parseInt(event.params.slug))
    return {page_standard};
}) satisfies LayoutServerLoad;