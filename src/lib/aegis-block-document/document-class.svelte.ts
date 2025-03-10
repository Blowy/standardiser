type Section = {
    title: string,
    block_id: number,
    blocks: Element[],
    locked: {state: boolean, user:string}|false
}
export type BlockType = "requirement"|"prose"|"media"

type Block = {
    block_id: number,
    type: BlockType,
    db_id: number,
    locked: {state: boolean, user:string}|false
}
export type Element = Section|Block|null
export type DocumentContent = Element[]
export type MoveType = "up"|"down"
export type ElementPosition = "end"|"start"|"after"|"before"

import {db} from "$lib/server/db/index"
import {eq} from "drizzle-orm"
import * as tables from "$lib/server/db/schema"


//============================================================//

export class AegisBlockDocument{
    private document:DocumentContent = $state([])
    private documentId:number = $state(0)

    getDocumentContent(){
        return this.document
    }

    setDocumentContent(documentString:string){
        this.document = JSON.parse(documentString)
    }

    getDocumentId(){
        return this.documentId
    }

    setDocumentId(documentId:number){
        this.documentId = documentId
    }

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

    getElementById(document:DocumentContent, id:number):Element|null{
        for (const element of document) {
            if (element != null) {
                if (element.block_id == id) {
                    return element;
                }
                if ('blocks' in element) {
                    const foundElement = this.getElementById(element.blocks, id);
                    if (foundElement) {
                        return foundElement;
                    }
                }
            }
        }
        return null;
    }

    getParentSectionId(document: DocumentContent, id: number, parentId: number | null = null): number | null {
        for (const element of document) {
            if (element != null) {
                if (element.block_id === id) {
                    return parentId;
                }
                if ('blocks' in element && element.blocks.length > 0) {
                    const foundElement = this.getParentSectionId(element.blocks, id, element.block_id);
                    if (foundElement !== null) {
                        return foundElement;
                    }
                }
            }
        }
        return null;
    }

    resequenceBlockIds(document:DocumentContent, currentId:number):number{
        document.forEach(element => {
            if (element != null || element != undefined){
                element.block_id = currentId
                currentId++
                if ('blocks' in element && Array.isArray(element.blocks)){
                    currentId = this.resequenceBlockIds(element.blocks, currentId)
                }
            }
        })
        return currentId
    }
    
    async serverAddSection(title: string,parentId?: number,position: ElementPosition="end",blockId?: number){
        console.log('Aegis Document Function - Server Add Section')
        const newSection:Section = {
            title: title,
            block_id: this.getHighestBlockId()+1,
            blocks: [],
            locked: false
        }
        console.log("new section generated:")
        console.table([{title: newSection.title, block_id: newSection.block_id, blocks: newSection.blocks}])
        if (parentId){
            console.log("Parent ID Provided")
            const parentSection = this.getElementById(this.document, parentId)
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
        this.resequenceBlockIds(this.document, 1)
        console.log(JSON.stringify(this.document)) 
        await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
    }

    async serverEditSectionTitle(id:number,newTitle:string){
        const section = this.getElementById(this.document, id)
        if (section && 'title' in section){
            section.title = newTitle
            await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
        }
    }

    async serverDeleteSection(id:number){
        const section = this.getElementById(this.document, id)
        const parentId = this.getParentSectionId(this.document, id)
        console.log(parentId)
        if (parentId){
            const parentSection = this.getElementById(this.document, parentId)
            if(parentSection && 'blocks' in parentSection){
                const index = parentSection.blocks.findIndex(section => section && section.block_id === id)
                if (index > -1){
                    if(parentSection.blocks[index] && Object.hasOwn(parentSection.blocks[index], 'blocks')){
                        if ('blocks' in parentSection.blocks[index] && parentSection.blocks[index].blocks.length > 0){
                            console.error("Section contains blocks. Please remove blocks before deleting the section.")
                        } else{
                            parentSection.blocks.splice(index, 1)
                            this.resequenceBlockIds(this.document, 1)
                            await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
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
                    this.resequenceBlockIds(this.document, 1)
                    await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
                }       
            }
        } else{
            console.error("Section not found")
        }
    }

    async serverAddBlock(blockType: BlockType,parentId?: number,position: ElementPosition="end",blockId?: number){
        console.log('Aegis Document Function - Server Add Block')
        const newBlock:Block = {
            type: blockType,
            block_id: this.getHighestBlockId()+1,
            db_id: 0,
            locked: false
        }
        console.log("new section generated:")
        console.table([{title: newBlock.type, block_id: newBlock.block_id, db_id: newBlock.db_id}])
        try{
            await db.transaction(async (tx)=>{
                const blockDbEntry = await tx.insert(blockType == 'requirement' ? tables.requirements : blockType == 'media' ? tables.media : tables.prose).values({}).returning();
                newBlock.db_id = blockDbEntry[0].id
                if (parentId){
                    console.log("Parent ID Provided")
                    const parentSection = this.getElementById(this.document, parentId)
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
                this.resequenceBlockIds(this.document, 1)
                console.log(JSON.stringify(this.document)) 
                await tx.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
            })
        } catch(err){
            console.error('Transaction failed', err)
        }
        
    }
    async serverDeleteBlock(id:number, parentId?:number){
        try{
            await db.transaction(async (tx)=>{
                console.log('Aegis Document Function - Server Delete Block')
                const block = this.getElementById(this.document, id)
                if(block){
                    if(block.locked != false){
                        throw new Error("Block is locked")
                    }
                }
                console.log(block)
                if (parentId){
                    console.log("Parent ID Provided")
                    const parentSection = this.getElementById(this.document, parentId)
                    if(parentSection && 'blocks' in parentSection){
                        console.log("Parent Section Found and is indeed a section")
                        const index = parentSection.blocks.findIndex(section => section && section.block_id === id)
                        if (index > -1){
                            if(parentSection.blocks[index]){
                                parentSection.blocks.splice(index, 1)
                                this.resequenceBlockIds(this.document, 1)
                                await tx.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
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
                        this.resequenceBlockIds(this.document, 1)
                        await tx.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
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
        console.log('Aegis Document Function - Server Move Element')
        console.table([{id, parentId, moveType}])   
        if(parentId){
            console.log('Parent ID passed')
            const parentSection = this.getElementById(this.document, parentId)
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
        this.resequenceBlockIds(this.document, 1)
        await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
    }

    async serverMoveElementComplex(id: number, parentId?:number, futureSectionId?:number, neighbourElementId?: number, position: ElementPosition = "end"){
        console.log('Server Move Complex')
        console.table([{id, parentId, futureSectionId, neighbourElementId, position}])
        try{
            if(parentId){
                const parentSection = this.getElementById(this.document, parentId)
                if(parentSection && 'blocks' in parentSection && parentSection.blocks.length>0){
                    const index = parentSection.blocks.findIndex(element => element && element.block_id === id)
                    if(index > -1){
                        const element = parentSection.blocks[index]
                        if(futureSectionId){
                            const futureSection = this.getElementById(this.document, futureSectionId)
                            if(futureSection && 'blocks' in futureSection){
                                if(neighbourElementId){
                                    const neighbourIndex = futureSection.blocks.findIndex(element => element && element.block_id === neighbourElementId)
                                    if(neighbourIndex > -1){
                                        if(position && (position == 'after' || position == 'before')){
                                            if (position == 'after'){
                                                futureSection.blocks.splice(neighbourIndex + 1, 0, element)
                                            } else if (position == 'before'){
                                                futureSection.blocks.splice(neighbourIndex, 0, element)
                                            }
                                        } else {
                                            throw new Error("Invalid position")
                                        }
                                    } else {
                                        throw new Error("Neighbour element not found")
                                    }
                                } else {
                                    if(position && (position == 'end' || position == 'start')){
                                        if (position == 'end'){
                                            futureSection.blocks.push(element)
                                        } else if (position == 'start'){
                                            futureSection.blocks.unshift(element)
                                        }
                                    } else {
                                        throw new Error("Invalid position")
                                    }
                                }
                            } else {
                                throw new Error("Valid future section not found")
                            }
                        } else {
                            if(neighbourElementId){
                                const neighbourIndex = this.document.findIndex(element => element && element.block_id === neighbourElementId)
                                if(neighbourIndex > -1){
                                    if(position && (position == 'after' || position == 'before')){
                                        if (position == 'after'){
                                            this.document.splice(neighbourIndex + 1, 0, element)
                                        } else if (position == 'before'){
                                            this.document.splice(neighbourIndex, 0, element)
                                        }
                                    } else {
                                        throw new Error("Invalid position")
                                    }
                                } else {
                                    throw new Error("Neighbour element not found in document")
                                }
                            } else {
                                if(position && (position == 'end' || position == 'start')){
                                    if (position == 'end'){
                                        this.document.push(element)
                                    } else if (position == 'start'){
                                        this.document.unshift(element)
                                    }
                                } else {
                                    throw new Error("Invalid position")
                                }
                            }
                        }
                        parentSection.blocks.splice(index, 1)
                    } else {
                        throw new Error("Element not found in parent section")
                    }
                } else{
                    throw new Error("Valid parent section not found")
                }
            } else {
                const index = this.document.findIndex(element => element && element.block_id === id)
                if(index > -1){
                    const element = this.document[index]
                    if(futureSectionId){
                        const futureSection = this.getElementById(this.document, futureSectionId)
                        if(futureSection && 'blocks' in futureSection){
                            if(neighbourElementId){
                                const neighbourIndex = futureSection.blocks.findIndex(element => element && element.block_id === neighbourElementId)
                                if(neighbourIndex > -1){
                                    if(position == 'after'){
                                        futureSection.blocks.splice(neighbourIndex + 1, 0, element)
                                    } else if (position == 'before'){
                                        futureSection.blocks.splice(neighbourIndex, 0, element)
                                    } else {
                                        throw new Error("Invalid position")
                                    }
                                } else {
                                    throw new Error("Neighbour element not found")
                                }
                            } else {
                                if(position && (position == 'end' || position == 'start')){
                                    if (position == 'end'){
                                        futureSection.blocks.push(element)
                                    } else if (position == 'start'){
                                        futureSection.blocks.unshift(element)
                                    }
                                } else {
                                    throw new Error("Invalid position")
                                }
                            }
                        } else {
                            throw new Error("Valid future section not found")
                        }
                    } else {
                        if(neighbourElementId){
                            const neighbourIndex = this.document.findIndex(element => element && element.block_id == neighbourElementId)
                            if(neighbourIndex > -1){
                                if(position && (position == 'after' || position == 'before')){
                                    if (position == 'after'){
                                        this.document.splice(neighbourIndex + 1, 0, element)
                                    } else if (position == 'before'){
                                        this.document.splice(neighbourIndex, 0, element)
                                    }
                                } else {
                                    throw new Error("Invalid position")
                                }
                            } else {
                                throw new Error("Neighbour element not found in document")
                            }
                        } else {
                            if(position && (position == 'end' || position == 'start')){
                                if (position == 'end'){
                                    this.document.push(element)
                                } else if (position == 'start'){
                                    this.document.unshift(element)
                                }
                            } else {
                                throw new Error("Invalid position")
                            }
                        }
                    }
                    this.document.splice(index, 1)
                } else {
                    throw new Error("Element not found in document")
                }
            }
            await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
        } catch(err){
            console.error('Complex Move Failed', err)
        }
    }

    async serverLockElement(id:number, userId:string){
        console.log('Aegis Document Function - Server Lock Element')
        const element = this.getElementById(this.document, id)
        if (element){
            if(element.locked == false){
                element.locked ={state: true, user: userId}
                await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
            } else {
                console.error("Element is already locked")
            }
        }
    }
    async serverUnlockElement(id:number, userId:string){
        console.log('Server Unlock Element')
        const element = this.getElementById(this.document, id)
        if(element){
            if(element.locked == false){
                console.error("Element is not locked")
            } else {
                if(element.locked.user == userId){
                    element.locked = false
                    await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
                } else {
                    console.error("Element is locked by another user")
                }
            }
        }
    }

    async serverMoveElementInto(blockId:number, direction:"up"|"down"){
        console.log('Server Move Element Into')
        console.table([{blockId, direction}])
        try{
            const parentId:number|null= this.getParentSectionId(this.document, blockId)
            console.log("Parent ID:")
            console.log(parentId)
            if(parentId != null){
                const parentSection = this.getElementById(this.document, parentId)
                if(parentSection && 'blocks' in parentSection){
                    console.log(`Parent Section:`)
                    console.log(parentSection)
                    const blockIdIndex = parentSection.blocks.findIndex(block => block && block.block_id === blockId)
                    console.log("Block Index:")
                    console.log(blockIdIndex)
                    if(blockIdIndex != -1){
                        console.log('Block found in parent section')
                        if(direction == "up"){
                            if(blockIdIndex > 0){
                                console.log("Not at top of section")
                                const neighbourElement = parentSection.blocks[blockIdIndex - 1]
                                console.log(neighbourElement)
                                if(neighbourElement && 'blocks' in neighbourElement){
                                    console.log("Neighbour element is a section")
                                    const block = parentSection.blocks[blockIdIndex]
                                    parentSection.blocks.splice(blockIdIndex, 1)
                                    neighbourElement.blocks.push(block)
                                } else {
                                    console.log("Neighbour element is a block")
                                    const block = parentSection.blocks[blockIdIndex]
                                    parentSection.blocks.splice(blockIdIndex, 1)
                                    parentSection.blocks.splice(blockIdIndex - 1, 0, block)
                                }
                            } else {
                                console.log("At top of section")
                                const grandparentSectionId = this.getParentSectionId(this.document, parentId)
                                console.log("Grandparent Section ID:")
                                console.log(grandparentSectionId)
                                if(grandparentSectionId != null){
                                    const grandparentSectionElement = this.getElementById(this.document, grandparentSectionId)
                                    console.log("Grandparent Section Element:")
                                    console.log(grandparentSectionElement)
                                    if(grandparentSectionElement && 'blocks' in grandparentSectionElement){
                                        console.log("grandparent section is valid")
                                        const parentSectionIndex = grandparentSectionElement.blocks.findIndex(section => section && section.block_id === parentId)
                                        console.log("Parent Section Index:")
                                        console.log(parentSectionIndex)
                                        if(parentSectionIndex > -1){
                                            console.log("Parent Section Index is valid")
                                            const block = parentSection.blocks[blockIdIndex]
                                            parentSection.blocks.splice(blockIdIndex, 1)
                                            if(parentSectionIndex > 0){
                                                grandparentSectionElement.blocks.splice(parentSectionIndex - 1, 0, block)
                                            } else {
                                                grandparentSectionElement.blocks.unshift(block)
                                            }
                                            
                                        } else {
                                            throw new Error("Parent section index invalid.")
                                        }
                                    } else {
                                        throw new Error("grandparent section invalid.")
                                    }
                                } else {
                                    const parentSectionIndex = this.document.findIndex(section => section && section.block_id === parentId)
                                    if(parentSectionIndex > -1){
                                        const block = parentSection.blocks[blockIdIndex]
                                        parentSection.blocks.splice(blockIdIndex, 1)
                                        if(parentSectionIndex > 0){
                                            this.document.splice(parentSectionIndex, 0, block)
                                        } else {
                                            this.document.unshift(block)
                                        }
                                    } 
                                }
                            }
                        } else if(direction == "down"){
                            if(blockIdIndex < parentSection.blocks.length - 1){
                                console.log("not at bottom of section")
                                const neighbourElement = parentSection.blocks[blockIdIndex + 1]
                                if(neighbourElement && 'blocks' in neighbourElement){
                                    console.log("Neighbour element is a section")
                                    const block = parentSection.blocks[blockIdIndex]
                                    console.log(block)
                                    parentSection.blocks.splice(blockIdIndex, 1)
                                    neighbourElement.blocks.unshift(block)
                                } else {
                                    console.log("Neighbour element is a block")
                                    const block = parentSection.blocks[blockIdIndex]
                                    console.log(block)
                                    parentSection.blocks.splice(blockIdIndex, 1)
                                    parentSection.blocks.splice(blockIdIndex + 1, 0, block)
                                }
                            } else {
                                console.log("at bottom of parent section")
                                const grandparentSection = this.getParentSectionId(this.document, parentId)
                                if(grandparentSection != null){
                                    const grandparentSectionElement = this.getElementById(this.document, grandparentSection)
                                    console.log("Grandparent Section Element:")
                                    console.log(grandparentSectionElement)
                                    if(grandparentSectionElement && 'blocks' in grandparentSectionElement){
                                        console.log("Grandparent Section is valid")
                                        const parentSectionIndex = grandparentSectionElement.blocks.findIndex(section => section && section.block_id === parentId)
                                        console.log("Parent Section Index:")
                                        console.log(parentSectionIndex)
                                        if(parentSectionIndex > -1){
                                            console.log("Parent Section Index is valid")
                                            const block = parentSection.blocks[blockIdIndex]
                                            console.log(block)
                                            parentSection.blocks.splice(blockIdIndex, 1)
                                            grandparentSectionElement.blocks.splice(parentSectionIndex+1, 0, block)
                                        }
                                    }
                                } else {
                                    const parentSectionIndex = this.document.findIndex(section => section && section.block_id === parentId)
                                    if(parentSectionIndex > - 1){
                                        const block = parentSection.blocks[blockIdIndex]
                                        parentSection.blocks.splice(blockIdIndex, 1)
                                        this.document.splice(parentSectionIndex + 1, 0, block)
                                    }
                                }
                            }
                        }
                    } else {
                        throw new Error("Block not found in parent section")
                    }
                }
            } else {
                const blockIndex = this.document.findIndex(block => block && block.block_id === blockId)
                if(blockIndex != -1){
                    if(direction == "up"){
                        if(blockIndex > 0){
                            const neighbourElement = this.document[blockIndex - 1]
                            if(neighbourElement && 'blocks' in neighbourElement){
                                const block = this.document[blockIndex]
                                this.document.splice(blockIndex, 1)
                                neighbourElement.blocks.push(block)
                            } else {
                                const block = this.document[blockIndex]
                                this.document.splice(blockIndex, 1)
                                this.document.splice(blockIndex - 1, 0, block)
                            }
                        } else {
                            throw new Error("Block is already at the top of the document")
                        }
                    } else if(direction == "down"){
                        if(blockIndex < this.document.length - 1){
                            const neighbourElement = this.document[blockIndex + 1]
                            if(neighbourElement && 'blocks' in neighbourElement){
                                const block = this.document[blockIndex]
                                this.document.splice(blockIndex, 1)
                                neighbourElement.blocks.unshift(block)
                            } else {
                                const block = this.document[blockIndex]
                                this.document.splice(blockIndex, 1)
                                this.document.splice(blockIndex + 1, 0, block)
                            }
                        } else {
                            throw new Error("Block is already at the bottom of the document")
                        }
                    }
                } else {
                    throw new Error("Block not found in document")
                }
            }
            console.log("updating the database")
            this.resequenceBlockIds(this.document, 1)
            await db.update(tables.standards).set({content: JSON.stringify(this.document)}).where(eq(tables.standards.id, this.documentId))
        } catch(err){
            console.error('Server Move Into Failed', err)
        }
    }
}

export const aegisDocument = new AegisBlockDocument()