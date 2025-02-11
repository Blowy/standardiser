import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"
import {db} from "$lib/server/db/index"

function updateDocumentWithDatabaseId(structure:string, blockId: number, id:number) {
    const parsedStructure = JSON.parse(structure);
    for (const block of parsedStructure) {
        if (block.block_id === blockId) {
            block.id = id;
            return parsedStructure;
        }
        if (block.blocks) {
            const foundBlock:any = updateDocumentWithDatabaseId(block.blocks, blockId, id);
            if (foundBlock) {
                block.id = id;
                return parsedStructure;
            }
        }
    }
}


export const GET: RequestHandler = async ({url}) => {
    const id = url.searchParams.get('id')

    const requirement = await db.select().from(tables.requirements).where(eq(tables.requirements.id, Number(id)))
    if (!requirement) {
        error(404, "Requirement not found")
    }
    return new Response(JSON.stringify(requirement[0]), {headers: {'content-type': 'application/json'}});
}

export const POST: RequestHandler = async ({request}) => {
    const data = await request.json()
    console.log(data)
    try {
        await db.transaction(async (tx) => {
            const requirement = await tx.insert(tables.requirements).values({clientId: data.clientId, requirementText: data.requirementText, rationaleText: data.rationaleText, guidanceText: data.guidanceText}).returning();
            console.log(requirement[0])
            let content = updateDocumentWithDatabaseId(data.content, data.blockId, requirement[0].id);
            content = JSON.stringify(content);
            await tx.update(tables.standards).set({content: content}).where(eq(tables.standards.id, data.standardId));
        });
        return new Response(JSON.stringify({ message: 'Transaction successful' }), { headers: { 'content-type': 'application/json' } });
    } catch (err:any) {
        console.error('Transaction failed', err);
        return new Response(JSON.stringify({ message: 'Transaction failed', error: err.message }), { headers: { 'content-type': 'application/json' } });
    }
}