import type { LayoutServerLoad } from './$types';
import {db} from "$lib/server/db/index"
import * as table from "$lib/server/db/schema"


export const load = (async () => {
	const standards = await db.select().from(table.standards)
	const user = {
		user_id: 1,
		first_name: 'Callum',
		last_name: 'Blow',
		email: 'callum.blow@gmail.com',
		role: 'admin',
	}
	return {user, standards};
}) satisfies LayoutServerLoad;
