import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"
import {db} from "$lib/server/db/index"

export const GET: RequestHandler = async ({url}) => {
    const id = url.searchParams.get('id')

    const prose = await db.select().from(tables.prose).where(eq(tables.prose.id, Number(id)))
    if (!prose) {
        error(404, "Prose not found")
    }
    return new Response(JSON.stringify(prose[0]), {headers: {'content-type': 'application/json'}});
}