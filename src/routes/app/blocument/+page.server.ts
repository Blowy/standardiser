import type { PageServerLoad, Actions } from "../$types";
import {db} from "$lib/server/db/index"
import * as tables from "$lib/server/db/schema"
import {eq} from "drizzle-orm"
import {Blocument} from "./document-class"
import type {ElementPosition, BlockType, MoveType} from "./document-class"
import { error } from "@sveltejs/kit";


export const load:PageServerLoad = async (request) => {
    const id = request.url.searchParams.get('id')
    let document;
    if(id){
        console.log('ID: '+id)
        document = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(document[0].content === null){
            document = []
        } else {
            document = document[0].content as string
        }
    }
    return {document: document}  
};

export const actions:Actions = {
    addSection: async (event)=>{
        console.log('Form Action Active - Add Section')
        const data = await event.request.formData()
        console.log(data)
        const id = data.get("addSectionStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        console.log('here...')
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
        console.log(initialContent[0].content)
        let blocument;
        if(id){
            blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        } else {
            error(500, {
                message: 'No ID Provided'
            })
        }
        blocument.serverAddSection(
            title,
            parentId,
            position,
            neighbour
        )
    },
    
    addBlock: async (event)=>{
        console.log('Form Action Active - Add Block')
        const data = await event.request.formData()
        console.log(data)
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
        console.table({type, parentId, position, neighbour})
        console.log(initialContent[0].content)
        let blocument;
        if(id){
            blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        } else {
            error(500, {
                message: 'No ID Provided'
            })
        }
        blocument.serverAddBlock(
            type,
            parentId,
            position,
            neighbour
        )
    },
    editSectionTitle: async (event)=>{
        console.log('Form Action Active - Edit Section Title')
        const data = await event.request.formData()
        console.log(data)
        const id = data.get("editSectionStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        console.log(initialContent[0].content)
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
        const blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        
        blocument.serverEditSectionTitle(
            sectionId,
            title
        )
        
    },
    deleteSection: async (event)=>{
        console.log('Form Action Active - Delete Section')
        const data = await event.request.formData()
        console.log(data)
        const id = data.get("deleteSectionStandardId") as string
        const  initialContent = await db.select().from(tables.standards).where(eq(tables.standards.id, Number(id)))
        if(initialContent[0].content === null){
            initialContent[0].content = []
        }
        console.log(initialContent[0].content)
        let sectionId;
        let parentId
        if(data.get('deleteSectionId')==null || data.get('deleteSectionId')== undefined){
            error(500, {message: 'No Element ID Provided'})
        } else {
            sectionId = parseInt(data.get('deleteSectionId') as string)
        }
        if(data.get('deleteSectionParentId')== null || data.get('deleteSectionParentId')== undefined){
            parentId = undefined
        } else {
            parentId = parseInt(data.get('deleteSectionParentId') as string)
        }
        const blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        
        blocument.serverDeleteSection(
            sectionId,
            parentId
        )
    },
    deleteBlock: async (event)=>{
        console.log('Form Action Active - Delete Block')
        const data = await event.request.formData()
        console.log(data)
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
        const blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        
        blocument.serverDeleteBlock(
            blockId,
            parentId
        )
    },
    moveElement: async (event)=>{
        console.log('Form Action Active - Move Element')
        const data = await event.request.formData()
        console.log(data)
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
        console.table({elementId, parentId})
        let blocument;
        if(id){
            blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        } else {
            error(500, {
                message: 'No ID Provided'
            })
        }
        blocument.serverMoveElement(
            elementId,
            moveType,
            parentId,
        )
    },
    moveElementComplex: async (event)=>{
        console.log('Form Action Active - Move Element Complex')
        const data = await event.request.formData()
        console.log(data)
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


        let blocument;
        if(id){
            blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        } else {
            error(500, {
                message: 'No ID Provided'
            })
        }
        blocument.serverMoveElementComplex(
            elementId,
            parentId,
            futureParentId,
            neighbourId,
            position
        )
    },
    lockElement: async (event)=>{
        console.log('Form Action Active - Lock Element')
        const data = await event.request.formData()
        console.log(data)
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
        let blocument;
        if(id){
            blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        } else {
            error(500, {
                message: 'No ID Provided'
            })
        }
        blocument.serverLockElement(
            lockElementId,
            lockElementUser
        )
    }, 
    unlockElement: async (event)=>{
        console.log('Form Action Active - Unlock Element')
        const data = await event.request.formData()
        console.log(data)
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
        let blocument;
        if(id){
            blocument = new Blocument(JSON.stringify(initialContent[0].content), parseInt(id))
        } else {
            error(500, {
                message: 'No ID Provided'
            })
        }
        blocument.serverUnlockElement(
            unlockElementId,
            unlockElementUser
        )
    }
    
}