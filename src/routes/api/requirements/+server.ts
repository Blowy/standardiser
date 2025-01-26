import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"
import {db} from "$lib/server/db/index"

export const GET: RequestHandler = async ({url}) => {
    const id = url.searchParams.get('id')

    const requirement = await db.select().from(tables.requirements).where(eq(tables.requirements.id, Number(id)))
    if (!requirement) {
        error(404, "Requirement not found")
    }
    return new Response(JSON.stringify(requirement[0]), {headers: {'content-type': 'application/json'}});
}