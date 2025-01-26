import {db} from "$lib/server/db/index"
import {sql} from "drizzle-orm"

export async function GET(){
    try {
        await db.execute(sql`select 1`)
        const res = new Response(JSON.stringify({status:'ok'}), {status: 200, headers: {'Content-Type': 'application/json'}})
        return res
    }catch (error:any){
        const res = new Response(JSON.stringify({status:"error", message:error.message||"unknown error"}), { status: 500, headers: {'Content-Type': 'application/json'}});
        return res
    }
}