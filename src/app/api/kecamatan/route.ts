import db from "@/lib/db";
import Database from "@/models/Kecamatan";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    await db();
    try{
        const data = await Database.find();
        return NextResponse.json(data);
    } catch (error){
        return NextResponse.json({error:"Error"}, { status: 500 });
    }
}
