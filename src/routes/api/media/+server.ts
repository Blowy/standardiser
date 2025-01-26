import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"
import {db} from "$lib/server/db/index"
import { utapi } from '$lib/server/uploadthing';

export const GET: RequestHandler = async ({url}) => {
    const id = url.searchParams.get('id')

    const media = await db.select().from(tables.media).where(eq(tables.media.id, Number(id)))
    if (!media) {
        error(404, "Media Item not found")
    }
    return new Response(JSON.stringify(media[0]), {headers: {'content-type': 'application/json'}});
}

export const DELETE = async ({url}) => {
    const id = url.searchParams.get('id')
    const media = await db.select().from(tables.media).where(eq(tables.media.id, Number(id)))
    if (!media) {
        error(404, "Media Item not found")
    }
    const url_segments = media[0].url?.split('/').filter(segment => segment)
    const filekey = url_segments?.[url_segments.length - 1]
    if (!filekey) {
        error(500, "Could not parse file key")
    }
    utapi.deleteFiles(filekey)
    await db.delete(tables.media).where(eq(tables.media.id, Number(id)))
    return new Response(JSON.stringify({message: "Deleted"}), {headers: {'content-type': 'application/json'}});
}