type Section = {
    title: string,
    block_id: number,
    blocks: Element[]
}
export type BlockType = "requirement"|"prose"|"media"

type Block = {
    block_id: number,
    type: BlockType,
    db_id: number
}
export type Element = Section|Block|null
export type ElementPosition = "end"|"start"|"after"|"before"
export type DocumentContent = Element[]
export type MoveType = "up"|"down"|"complex"

import {db} from "$lib/server/db/index"
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"


export class Blocument{
    constructor(documentString:string, document_id:number){
        //console.log('Blocument Constructor')
        this.document = JSON.parse(documentString)
        //console.log('Document parsed')
        //console.log(this.document)
        this.document_id = Number(document_id)
        //console.log('Document ID Set')
        //console.log(this.document_id)
    }
    document:DocumentContent
    document_id:number

    get documentContent(){
        return this.document
    }

    /**
    * Returns the highest block ID in the document structure.
    * 
    * @param document the document structure to search
    * @returns the highest block ID in the document structure
    */
    getHighestBlockId(): number {
        let highestId = 0;
        const stack: any[] = [...this.document];

        while (stack.length > 0) {
            const element = stack.pop();
            if (element != null) {
                if (element.block_id > highestId) {
                    highestId = element.block_id;
                }
                if ('blocks' in element && Array.isArray(element.blocks)) {
                    stack.push(...element.blocks);
                }
            }
        }
        return highestId;
    }


    /**
    * Finds an element in the document structure by its Block ID.
    * 
    * @param document {DocumentContent} the document structure to search
    * @param id {number} the Block ID to search for
    * @returns the Element (a section or block) with the given ID, or null if not found
    */
    static getElementById(document:DocumentContent, id:number):Element|null{
        for (const element of document) {
            if (element != null) {
                if (element.block_id === id) {
                    return element;
                }
                if ('blocks' in element) {
                    const foundElement = Blocument.getElementById(element.blocks, id);
                    if (foundElement) {
                        return foundElement;
                    }
                }
            }
        }
        return null;
    }

    static getParentSectionId(document:DocumentContent, id:number):number|null{
        let parentSection:number|null = null 
        for(const element of document){
            if(element != null){
                if (element.block_id == id){
                    return parentSection
                }
                if ('blocks' in element){
                    parentSection = element.block_id
                    const foundElement = Blocument.getParentSectionId(element.blocks, id)
                    if(foundElement){
                        return parentSection
                    }
                }
            }          
        }
        return null
    }

    /**
     * Recursively traverses the document structure and reorders all Block IDs in ascending order. 
     * @param {DocumentContent} document - The document structure to resequence
     * @returns {DocumentContent} - The original document strutcure with the Block IDs in ascending order
     */
    static resequenceBlockIds(document:DocumentContent, currentId:number):number{
        //console.log("Blocument Function - Resequence Block IDs")
        document.forEach(element => {
            if (element != null || element != undefined){
                //console.log("Element is ok")
                element.block_id = currentId
                //console.log("initial reassignment")
                currentId++
                if ('blocks' in element && Array.isArray(element.blocks)){
                    currentId = Blocument.resequenceBlockIds(element.blocks, currentId)
                }
            }
        })
        return currentId
    }
    
    /**
     * Adds a section to the document structure.
     * @param {string} title - The title which will be applied to the section.
     * @param {number} [parentId] - An optional parent ID which enables nesting of a section within another section.
     * @param {ElementPosition} [position="end"] - The position at which the section should be inserted. Options are "end", "start", "after", "before". For "after" and "before", a block ID must also be provided.
     * @param {number} [blockId] - The optional ID of the block after or before which the section should be inserted.
     */
    async serverAddSection(title: string,parentId?: number,position: ElementPosition="end",blockId?: number){
        console.log('Blocument Function - Server Add Section')
        const newSection:Section = {
            title: title,
            block_id: this.getHighestBlockId()+1,
            blocks: []
        }
        console.log("new section generated:")
        console.table([{title: newSection.title, block_id: newSection.block_id, blocks: newSection.blocks}])
        if (parentId){
            console.log("Parent ID Provided")
            const parentSection = Blocument.getElementById(this.document, parentId)
            if (parentSection){
                console.log("Parent element found")
                if('blocks' in parentSection){
                    console.log("Parent element has blocks attribute")
                    if (position === "end"){
                        console.log("position: end")
                        parentSection.blocks.push(newSection)
                    } else if (position === "start"){
                        console.log("position: start")
                        parentSection.blocks.unshift(newSection)
                    } else if (position === "after" || position === "before"){
                        const index = parentSection.blocks.findIndex(section => section && section.block_id === blockId)
                        if (index > -1){
                            if (position === "after"){
                                parentSection.blocks.splice(index + 1, 0, newSection)
                            } else if (position === "before"){
                                parentSection.blocks.splice(index, 0, newSection)
                            }
                        }
                    }
                }
                else{
                    console.error("Parent element does not have a blocks attribute. Please ensure that the parent element is a section.")
                }
            }
            else{
                console.error("Parent element not found")
            }
        }
        else {
            console.log("No parent ID provided")
            if (position === "end"){
                console.log("position: end")
                this.document.push(newSection)
            } else if (position === "start"){
                console.log("position: start")
                this.document.unshift(newSection)
            } 
            else if (position === "after" || position === "before"){
                console.log("position: after/before")
                if (blockId){
                    console.log('block ID provided')
                    const index = this.document.findIndex(element => element && element.block_id === blockId)
                    if (index > -1){
                        if (position === "after"){
                            this.document.splice(index + 1, 0, newSection)
                        } else if (position === "before"){
                            this.document.splice(index, 0, newSection)
                        }
                    } else {
                        console.error("Block ID not found")
                    }
                }
                else{
                    console.error("No block ID provided for insertion after or before")
                }
            }
        }
        
        Blocument.resequenceBlockIds(this.document, 1)
        console.log(JSON.stringify(this.document)) 
        await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
    }

    /**
     * Change the title of a section that has already been provided
     * @param {number} id - The Block ID of the section to edit 
     * @param {string} newTitle - The new title to apply to the section
     */
    async serverEditSectionTitle(id:number,newTitle:string){
        const section = Blocument.getElementById(this.document, id)
        if (section && 'title' in section){
            section.title = newTitle
            await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
        }
    }

    /**
     * Delete a section from the document structure.
     * @param {number} id - The Block ID of the section to delete.
     */
    async serverDeleteSection(id:number, parentId?:number){
        const section = Blocument.getElementById(this.document, id)
        if (parentId){
            const parentSection = Blocument.getElementById(this.document, parentId)
            if(parentSection && 'blocks' in parentSection){
                const index = parentSection.blocks.findIndex(section => section && section.block_id === id)
                if (index > -1){
                    if(parentSection.blocks[index] && Object.hasOwn(parentSection.blocks[index], 'blocks')){
                        if ('blocks' in parentSection.blocks[index] && parentSection.blocks[index].blocks.length > 0){
                            console.error("Section contains blocks. Please remove blocks before deleting the section.")
                        } else{
                            parentSection.blocks.splice(index, 1)
                            Blocument.resequenceBlockIds(this.document, 1)
                            await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
                        }
                    }
                }
            }
        } else if (section && 'blocks' in section){
            if(section.blocks.length > 0){
                console.error("Section contains blocks. Please remove blocks before deleting the section.")
            } 
            else{
                const index = this.document.findIndex(element => element && element.block_id === id) //Woah woah woah - how can this possibly work?
                if (index > -1){
                    this.document.splice(index, 1)
                    Blocument.resequenceBlockIds(this.document, 1)
                    await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
                }       
            }
        } else{
            console.error("Section not found")
        }
    }

    /**
     * Add a block to the document structure. Will add a new block to the database, and also update the document structure with the new block.
     * @async
     * @param {BlockType} type - The type of block to add.
     * @param {number} [parentId] - The optional Block ID of the section to which the block should be added if nesting within a section is required.
     * @param {ElementPosition} [position="end"] - The position at which the block should be inserted. Options are "end", "start", "after", "before". For "after" and "before", a block ID must also be provided.
     * @param {number} [blockId] - The optional ID of the block after or before which the block should be inserted.
     */

    async serverAddBlock(blockType: BlockType,parentId?: number,position: ElementPosition="end",blockId?: number){
        console.log('Blocument Function - Server Add Block')
        const newBlock:Block = {
            type: blockType,
            block_id: this.getHighestBlockId()+1,
            db_id: 0
        }
        console.log("new section generated:")
        console.table([{title: newBlock.type, block_id: newBlock.block_id, db_id: newBlock.db_id}])
        try{
            await db.transaction(async (tx)=>{
                const blockDbEntry = await tx.insert(blockType == 'requirement' ? tables.requirements : blockType == 'media' ? tables.media : tables.prose).values({}).returning();
                newBlock.db_id = blockDbEntry[0].id
                if (parentId){
                    console.log("Parent ID Provided")
                    const parentSection = Blocument.getElementById(this.document, parentId)
                    if (parentSection){
                        console.log("Parent element found")
                        if('blocks' in parentSection){
                            console.log("Parent element has blocks attribute")
                            if (position === "end"){
                                console.log("position: end")
                                parentSection.blocks.push(newBlock)
                            } else if (position === "start"){
                                console.log("position: start")
                                parentSection.blocks.unshift(newBlock)
                            } else if (position === "after" || position === "before"){
                                const index = parentSection.blocks.findIndex(section => section && section.block_id === blockId)
                                if (index > -1){
                                    if (position === "after"){
                                        parentSection.blocks.splice(index + 1, 0, newBlock)
                                    } else if (position === "before"){
                                        parentSection.blocks.splice(index, 0, newBlock)
                                    }
                                }
                            }
                        }
                        else{
                            tx.rollback()
                            throw new Error("Parent element does not have a blocks attribute. Please ensure that the parent element is a section.")
                        }
                    }
                    else{
                        tx.rollback()
                        throw new Error("Parent element not found")
                    }
                } else {
                    console.log("No parent ID provided")
                    if (position === "end"){
                        console.log("position: end")
                        this.document.push(newBlock)
                    } else if (position === "start"){
                        console.log("position: start")
                        this.document.unshift(newBlock)
                    } 
                    else if (position === "after" || position === "before"){
                        console.log("position: after/before")
                        if (blockId){
                            console.log('block ID provided')
                            const index = this.document.findIndex(element => element && element.block_id === blockId)
                            if (index > -1){
                                if (position === "after"){
                                    this.document.splice(index + 1, 0, newBlock)
                                } else if (position === "before"){
                                    this.document.splice(index, 0, newBlock)
                                }
                            } else {
                                tx.rollback()
                                throw new Error("Block ID not found")
                            }
                        }
                        else{
                            tx.rollback()
                            throw new Error("No block ID provided for insertion after or before")
                        }
                    }
                }
                Blocument.resequenceBlockIds(this.document, 1)
                console.log(JSON.stringify(this.document)) 
                await tx.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
            })
        } catch(err){
            console.error('Transaction failed', err)
        }
        
    }
    async serverDeleteBlock(id:number, parentId?:number){
        try{
            await db.transaction(async (tx)=>{
                console.log('Blocument Function - Server Delete Block')
                const block = Blocument.getElementById(this.document, id)
                console.log(block)
                if (parentId){
                    console.log("Parent ID Provided")
                    const parentSection = Blocument.getElementById(this.document, parentId)
                    if(parentSection && 'blocks' in parentSection){
                        console.log("Parent Section Found and is indeed a section")
                        const index = parentSection.blocks.findIndex(section => section && section.block_id === id)
                        if (index > -1){
                            if(parentSection.blocks[index]){
                                parentSection.blocks.splice(index, 1)
                                Blocument.resequenceBlockIds(this.document, 1)
                                await tx.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
                            }
                        }
                        else{
                            tx.rollback()
                            throw new Error("Block not found")
                        }
                    }
                } else if (block){
                    const index = this.document.findIndex(element => element && element.block_id === id)
                    if (index > -1){
                        this.document.splice(index, 1)
                        Blocument.resequenceBlockIds(this.document, 1)
                        await tx.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
                    }       
                } else{
                    tx.rollback()
                    throw new Error("Block")
                }
                if (block && 'db_id' in block){
                    if (block.type == 'requirement'){
                        await tx.delete(tables.requirements).where(eq(tables.requirements.id, block.db_id))
                    } else if (block.type == 'media'){
                        //DELETE FROM UPLOADTHING HERE WHEN READY
                        await tx.delete(tables.media).where(eq(tables.media.id, block.db_id))
                    } else if (block.type == 'prose'){
                        await tx.delete(tables.prose).where(eq(tables.prose.id, block.db_id))
                    } else {
                        tx.rollback()
                        throw new Error("Block type not recognised")
                    }
                }
            })
        } catch(err){
            console.error('Transaction failed', err)
        }
    }
    async serverMoveElement(id:number, moveType:MoveType, parentId?:number){
        console.log('Blocument Function - Server Move Element')
        console.table([{id, parentId, moveType}])   
        if(parentId){
            console.log('Parent ID passed')
            const parentSection = Blocument.getElementById(this.document, parentId)
            if(parentSection){
                console.log('Parent Section found')
                if('blocks' in parentSection){
                    console.log('Parent Section has blocks attribute - as such, it must be a section')
                    if (parentSection.blocks.length > 0){
                        console.log('Parent Section has blocks')
                        const index = parentSection.blocks.findIndex(section => section && section.block_id === id)
                        if (index > -1){
                            console.log('Element found in parent section')
                            const block = parentSection.blocks[index]
                            if (moveType == 'up'){
                                console.log('Move type is up')
                                if (index > 0){
                                    console.log('Index is greater than 0')
                                    parentSection.blocks.splice(index, 1)
                                    parentSection.blocks.splice(index-1, 0, block)
                                }
                            } else if (moveType == 'down'){
                                console.log('Move type is down')
                                if (index < parentSection.blocks.length - 1){
                                    parentSection.blocks.splice(index, 1)
                                    parentSection.blocks.splice(index+1, 0, block)
                                }
                            }
                        } else {
                            console.error("Element not found in parent section")
                        } 
                    }
                    else {
                        console.error("Parent section has no blocks")
                    }
                } else {
                    console.error("Element with Parent Section ID does exist, but does not have a blocks array attribute. ")
                }
            } else {
                console.error("Parent section not found")
            }
        } else{
            const index = this.document.findIndex(element => element && element.block_id === id)
            if (index > -1){
                console.log('Element found in document')
                const block = this.document[index]
                if (moveType == 'up'){
                    if (index > 0){
                        this.document.splice(index, 1)
                        this.document.splice(index-1, 0, block)
                    } else {
                        console.error("Block is already at the top of the document")
                    }
                } else if (moveType == 'down'){
                    if (index < this.document.length - 1){
                        this.document.splice(index, 1)
                        this.document.splice(index+1, 0, block)
                    } else {
                        console.error("Block is already at the bottom of the document")
                    }
                }
            } else {
                console.error("Element not found in document")
            }
        }
        Blocument.resequenceBlockIds(this.document, 1)
        await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.document_id))
    }
}