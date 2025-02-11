import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"
import {db} from "$lib/server/db/index"


function updateDocumentWithDatabaseId(structure:any, blockId: number, id:number) {    console.log('received structure: ')
    console.log('received block ID: '+blockId)
    console.log('received database ID: '+id)
    for (const block of structure) {
        if (block.block_id === blockId) {
            block.id = id;
            console.log('took first branch')
            return structure;
        }
        if (block.blocks) {
            console.log('recursion necessary - taking second branch')
            const foundBlock:any = updateDocumentWithDatabaseId(block.blocks, blockId, id);
            if (foundBlock) {
                block.id = id;
                return structure;
            }
        }
    }
}

export const GET: RequestHandler = async ({url}) => {
    const id = url.searchParams.get('id')

    const prose = await db.select().from(tables.prose).where(eq(tables.prose.id, Number(id)))
    if (!prose) {
        error(404, "Prose not found")
    }
    return new Response(JSON.stringify(prose[0]), {headers: {'content-type': 'application/json'}});
}

export const POST: RequestHandler = async ({request}) => {
    const data = await request.json()
    console.log('Server Function active - inputs received:\n')
    console.log(data)
    try {
        await db.transaction(async (tx) => {
            const prose = await tx.insert(tables.prose).values({content: data.proseText}).returning();
            console.log('Database call successful - output: ')
            console.log(prose[0])
            let content = updateDocumentWithDatabaseId(JSON.parse(data.content), data.blockId, prose[0].id);
            content = JSON.stringify(content);
            await tx.update(tables.standards).set({content: content}).where(eq(tables.standards.id, data.standardId));
        });
        return new Response(JSON.stringify({ message: 'Transaction successful' }), { headers: { 'content-type': 'application/json' } });
    } catch (err:any) {
        console.error('Transaction failed', err);
        return new Response(JSON.stringify({ message: 'Transaction failed', error: err.message }), { headers: { 'content-type': 'application/json' } });
    }
}