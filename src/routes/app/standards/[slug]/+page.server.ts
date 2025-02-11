import type { PageServerLoad } from './$types';
import {error} from "@sveltejs/kit"

const data_test = JSON.parse(`{
    "standard": 
    [{
    "block_id": 1,
    "title": "Section 1",
    "blocks": 
    [
        {
            "block_id":2,
            "title": "Topic 1",
            "blocks": [
                {
                    "block_id": 3,
                    "id": 1,
                    "type":"prose"
                },
                {
                    "block_id": 4,
                    "id": 1,
                    "type":"media"
                },
                {
                    "block_id": 5,
                    "id": 2,
                    "type":"prose"
                }
            ]
        },
        {
            "block_id": 6,
            "title": "Topic 2",
            "blocks": [
                {
                    "block_id": 7,
                    "id": 1,
                    "type":"requirement"
                }
            ]
        }
    ]
},
{
    "block_id": 8,
    "title": "Section 2",
    "blocks":[
        {
            "block_id": 9,
            "title": "Topic 1",
            "blocks": 
            [
                {
                    "block_id": 10,
                    "id": 2,
                    "type":"media"
                },
                {
                    "block_id": 11,
                    "id": 3,
                    "type":"prose"
                },
                {
                    "block_id": 12,
                    "title": "Subtopic 1",
                    "blocks": [
                        {
                            "block_id": 13,
                            "id": 4,
                            "type":"prose"
                        },
                        {
                            "block_id": 14,
                            "id": 3,
                            "type":"media"
                        },
                        {
                            "block_id": 15,
                            "title": "Subsubtopic 1",
                            "blocks": [
                                {
                                    "block_id": 16,
                                    "id": 5,
                                    "type":"prose"
                                },
                                {
                                    "block_id": 17,
                                    "id": 4,
                                    "type":"media"
                                }
                            ]    
                        }
                    ]
                }
            ]
        }
    ]
}]}`)

export const load = (async (event) => {

    const parent_data = await event.parent()
    const page_standard = parent_data.page_standard
    const standard_id = parent_data.standard_id
    if (!page_standard)
    {
        error(404, "Standard not found")
    }
    if(page_standard.content == null){
        page_standard.content = []
    }

    return {page_standard, data_test, standard_id};
}) satisfies PageServerLoad;