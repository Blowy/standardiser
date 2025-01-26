import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/index';
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import {eq} from "drizzle-orm"
function validateNonNullString(value: FormDataEntryValue | null): string {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error('Invalid input: value must be a non-null string');
    }
    return value;
}

export const load = (async () => {

    return {};
}) satisfies PageServerLoad;

export const actions = {
    add: async (event) => {
        const data = await event.request.formData()
        const title = data.get('modal-standard-title')
        const version = data.get('modal-standard-ver')
        const status = data.get('modal-standard-status')
        const doc_number = data.get('modal-standard-doc-num')
        

        const validatedTitle = validateNonNullString(title);
        const validatedVersion = validateNonNullString(version);
        const validatedStatus = validateNonNullString(status);
        const validatedDocNumber = validateNonNullString(doc_number);

        const new_standard = await db.insert(table.standards).values({title:validatedTitle,version:validatedVersion,status:validatedStatus,docNumber:validatedDocNumber}).returning()
        redirect(303, '/app/standards/'+new_standard[0].id)
    },
    edit: async (event) => {
        const data = await event.request.formData()
        const id = data.get('modal-edit-id')
        const title = data.get('modal-edit-title')
        const version = data.get('modal-edit-ver')
        const status = data.get('modal-edit-status')
        const doc_number = data.get('modal-edit-doc-num')

        const validatedId = validateNonNullString(id);
        const validatedTitle = validateNonNullString(title);
        const validatedVersion = validateNonNullString(version);
        const validatedStatus = validateNonNullString(status);
        const validatedDocNumber = validateNonNullString(doc_number);

        const updated_standard = await db.update(table.standards).set({title:validatedTitle,version:validatedVersion,status:validatedStatus,docNumber:validatedDocNumber}).where(eq(table.standards.id, parseInt(validatedId))).returning()
        redirect(303, '/app/standards/'+updated_standard[0].id)
    },
    delete: async (event) => {
        const data = await event.request.formData()
        const id = data.get('modal-delete-id')
        const validatedId = validateNonNullString(id);
        await db.delete(table.standards).where(eq(table.standards.id, parseInt(validatedId)))
        return {success: true}
    }
} satisfies Actions;