import type { Actions } from "../$types";
import {db} from "$lib/server/db/index"
import * as tables from "$lib/server/db/schema"
import {eq} from "drizzle-orm"
import {aegisDocument} from "$lib/aegis-block-document/document-class.svelte"
import type {ElementPosition, BlockType, MoveType, DocumentContent} from "$lib/aegis-block-document/document-class.svelte"
import { error } from "@sveltejs/kit";


function treeMapper(tree:any){
    const newTree:DocumentContent = []
    tree.forEach((element:any)=>{
        if(element){
            if('title' in element){
                const newElement = {
                    block_id: element.block_id,
                    title: element.title,
                    blocks: treeMapper(element.blocks),
                    locked: element.locked,
                    addAboveOpen: false,
                    newSectionInput: false,
                    editTitleInput: false,
                    addSectionToEmptySection: false
                }
                newTree.push(newElement)
            } else {
                const newElement = {
                    block_id: element.block_id,
                    type: element.type,
                    locked: element.locked,
                    db_id: element.db_id,
                    addAboveOpen: false,
                    newSectionInput: false
                }
                newTree.push(newElement)
            }
        }
    })
    return newTree
}

export const load = (async (event) => {
    const id = parseInt(event.params.slug)
    let standard;
    let document:any;
    if(id){
        standard = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        standard = standard[0]
        if(standard){
            if(standard.content === null){
                document = []
            } else {
                document = treeMapper(standard.content)
                console.dir(document)
            }
        } else{
            error(404, {message: 'Standard Not Found'})
        }
    } else {
        error(500, {message: 'No ID Provided'})
    }
    return {standard: standard, document: document}  
})

export const actions:Actions = {
    addSection: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("addSectionStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let title;
        let parentId;
        let neighbour;
        let position: ElementPosition;
        if(data.get('addSectionTitle')==null || data.get('addSectionTitle')== undefined){
            title = 'New Section'
        } else {
            title = data.get('addSectionTitle') as string
        }
        if(data.get('addSectionParentId')==null || data.get('addSectionParentId')== undefined){
            parentId = undefined
        } else {
            parentId = parseInt(data.get('addSectionParentId') as string)
        }
        if(data.get('addSectionNeighbourId')==null|| data.get('addSectionNeighbourId')== undefined){
            neighbour = undefined
        } else {
            neighbour = parseInt(data.get('addSectionNeighbourId') as ElementPosition)
        }
        if(data.get('addSectionPosition')==null|| data.get('addSectionPosition')== undefined){
            position = 'end'
        } else {
            position = data.get('addSectionPosition') as ElementPosition
        }
        console.table({title, parentId, neighbour, position})
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverAddSection(
            title,
            parentId,
            position,
            neighbour
        )
    },
    
    addBlock: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("addBlockStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let type;
        let parentId;
        let position;
        let neighbour;
        if(data.get('addBlockType')==null || data.get('addBlockType')== undefined){
            error(500, {message: 'No Type Provided'})
        } else {
            type = data.get('addBlockType') as BlockType
        }
        if(data.get('addBlockParentId')==null || data.get('addBlockParentId')== undefined){
            parentId = undefined
        } else {
            parentId = parseInt(data.get('addBlockParentId') as string)
        }
        if(data.get('addBlockPosition')==null || data.get('addBlockPosition')== undefined){
            position = undefined
        } else {
            position = data.get('addBlockPosition') as ElementPosition
        }
        if(data.get('addBlockNeighbourId')==null || data.get('addBlockNeighbourId')== undefined){
            neighbour = undefined
        } else {
            neighbour = parseInt(data.get('addBlockNeighbourId') as string)
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverAddBlock(
            type,
            parentId,
            position,
            neighbour
        )
    },
    editSectionTitle: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("editSectionStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let title;
        let sectionId;
        if(data.get('editSectionTitle')==null || data.get('editSectionTitle')== undefined){
            error(500, {message: 'No Title Provided'})
        } else {
            title = data.get('editSectionTitle') as string
        }
        if(data.get('editSectionId')==null || data.get('editSectionId')== undefined){
            error(500, {message: 'No Section ID Provided'})
        } else {
            sectionId = parseInt(data.get('editSectionId') as string)
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverEditSectionTitle(
            sectionId,
            title
        )
        
    },
    deleteSection: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("deleteSectionStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let sectionId;
        if(data.get('deleteSectionId')==null || data.get('deleteSectionId')== undefined){
            error(500, {message: 'No Element ID Provided'})
        } else {
            sectionId = parseInt(data.get('deleteSectionId') as string)
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverDeleteSection(
            sectionId,
        )
    },
    deleteBlock: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("deleteBlockStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let blockId;
        let parentId
        if(data.get('deleteBlockId')==null || data.get('deleteBlockId')== undefined){
            error(500, {message: 'No Element ID Provided'})
        } else {
            blockId = parseInt(data.get('deleteBlockId') as string)
        }
        if(data.get('deleteBlockParentId')== null || data.get('deleteBlockParentId')== undefined){
            parentId = undefined
        } else {
            parentId = parseInt(data.get('deleteBlockParentId') as string)
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverDeleteBlock(
            blockId,
            parentId
        )
    },
    moveElement: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("moveElementStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let elementId;
        let parentId;
        let moveType;
        if(data.get('moveElementId')==null || data.get('moveElementId')== undefined){
            error(500, {message: 'No Element ID Provided'})
        } else {
            elementId = parseInt(data.get('moveElementId') as string)
        }
        if(data.get('moveElementParentId')==null || data.get('moveElementParentId')== undefined || data.get('moveElementParentId')==''){
            parentId = undefined
        } else {
            parentId = parseInt(data.get('moveElementParentId') as string)
        }
        if(data.get('moveElementType')==null || data.get('moveElementType')== undefined){
            error(500, {message: 'No Move Type Provided'})
        }else {
            moveType = data.get('moveElementType') as MoveType
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverMoveElement(
            elementId,
            moveType,
            parentId,
        )
    },
    moveElementInto: async(event)=>{
        const data = await event.request.formData()
        const id = data.get("moveElementIntoStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let elementId;
        let moveType;
        if(data.get('moveElementIntoId')==null || data.get('moveElementIntoId')== undefined || data.get('moveElementIntoId')==''){
            error(500, {message: 'No Element ID Provided'})
        } else {
            elementId = parseInt(data.get('moveElementIntoId') as string)
        }
        if(data.get('moveElementIntoType')==null || data.get('moveElementIntoType')== undefined || data.get('moveElementIntoType')==''){
            error(500, {message: 'No Move Type Provided'})
        } else {
            moveType = data.get('moveElementIntoType') as MoveType
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverMoveElementInto(
            elementId,
            moveType
        )
        
    },
    moveElementComplex: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("moveElementStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let elementId;
        let parentId;
        let futureParentId;
        let neighbourId;
        let position;
        if(data.get('moveElementComplexId')==null || data.get('moveElementComplexId')== undefined || data.get('moveElementComplexId')==''){
            error(500, {message: 'No Element ID Provided'})
        } else {
            elementId = parseInt(data.get('moveElementComplexId') as string)
        }
        if(data.get('moveElementComplexParentId')==null || data.get('moveElementComplexParentId')== undefined || data.get('moveElementComplexParentId')==''){
            parentId = undefined
        } else {
            parentId = parseInt(data.get('moveElementComplexParentId') as string)
        }
        if(data.get('moveElementComplexFutureParentId')==null || data.get('moveElementComplexFutureParentId')== undefined || data.get('moveElementComplexFutureParentId')==''){
            futureParentId = undefined
        } else {
            futureParentId = parseInt(data.get('moveElementComplexFutureParentId') as string)
        }
        if(data.get('moveElementComplexFutureNeighbourId')==null || data.get('moveElementComplexFutureNeighbourId')== undefined || data.get('moveElementComplexFutureNeighbourId')==''){
            neighbourId = undefined
        } else {
            neighbourId = parseInt(data.get('moveElementComplexFutureNeighbourId') as string)
        }
        if(data.get('moveElementComplexPosition')==null || data.get('moveElementComplexPosition')== undefined){
            position = "end" as ElementPosition
        } else {
            position = data.get('moveElementComplexPosition') as ElementPosition
        }


        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverMoveElementComplex(
            elementId,
            parentId,
            futureParentId,
            neighbourId,
            position
        )
    },
    lockElement: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("lockElementStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let lockElementId;
        let lockElementUser
        if(data.get('lockElementId')==null || data.get('lockElementId')== undefined || data.get('lockElementId')==''){
            error(500, {message: 'No Element ID Provided'})
        } else {
            lockElementId = parseInt(data.get('lockElementId') as string)
        }
        if(data.get('lockElementUser')==null || data.get('lockElementUser')== undefined || data.get('lockElementUser')==''){
            error(500, {message: 'No User ID Provided'})
        } else {
            lockElementUser = data.get('lockElementUser') as string
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverLockElement(
            lockElementId,
            lockElementUser
        )
    }, 
    unlockElement: async (event)=>{
        const data = await event.request.formData()
        const id = data.get("unlockElementStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        let unlockElementId;
        let unlockElementUser
        if(data.get('unlockElementId')==null || data.get('unlockElementId')== undefined || data.get('unlockElementId')==''){
            error(500, {message: 'No Element ID Provided'})
        } else {
            unlockElementId = parseInt(data.get('unlockElementId') as string)
        }
        if(data.get('unlockElementUser')==null || data.get('unlockElementUser')== undefined || data.get('unlockElementUser')==''){
            error(500, {message: 'No User ID Provided'})
        } else {
            unlockElementUser = data.get('unlockElementUser') as string
        }
        aegisDocument.setDocumentContent(JSON.stringify(initialContent[0].content))
        aegisDocument.setDocumentId(parseInt(id))
        await aegisDocument.serverUnlockElement(
            unlockElementId,
            unlockElementUser
        )
    }
    
}