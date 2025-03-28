import db from "@/lib/db";
import Kecamatan from "@/models/Kecamatan";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    await db();
    try{
        const kecamatanList = await Kecamatan.find({}).sort({ id: 1 });
        return NextResponse.json(kecamatanList);
    }catch (error){
        return NextResponse.json({error},{status: 500});
    }
}