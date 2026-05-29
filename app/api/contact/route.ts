import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    await pool.query(
        `INSERT INTO contacts (name, email, message, created_at) VALUES ($1, $2, $3, NOW())`,
        [name, email, message]
    );

    return NextResponse.json({ success: true });
}