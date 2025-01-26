
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event)=>{
		const data = await event.request.formData()
		const test = data.get('select')
		return { success: true, message: `You selected ${test}`}
	}
};