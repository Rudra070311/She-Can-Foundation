import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import pool from "@/lib/db";

function getVerificationSecret() {
    return process.env.EMAIL_VERIFICATION_SECRET || process.env.SUPABASE_ANON_KEY || "fallback-verification-secret";
}

function isVerifiedEmailCookieValid(cookieValue: string | undefined, email: string) {
    if (!cookieValue) {
        return false;
    }

    const separatorIndex = cookieValue.lastIndexOf("::");

    if (separatorIndex === -1) {
        return false;
    }

    const storedEmail = cookieValue.slice(0, separatorIndex);
    const signature = cookieValue.slice(separatorIndex + 2);

    if (!storedEmail || !signature || storedEmail !== email) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", getVerificationSecret())
        .update(email)
        .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}

async function insertContactViaSupabase(name: string, email: string, message: string) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase REST configuration.");
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/contacts`, {
        method: "POST",
        headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            message,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Supabase REST insert failed with status ${response.status}.`);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, email, message } = await request.json();
        const verifiedEmailCookie = request.cookies.get("verified_email")?.value;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        const decodedVerifiedEmailCookie = verifiedEmailCookie ? decodeURIComponent(verifiedEmailCookie) : undefined;

        if (!isVerifiedEmailCookieValid(decodedVerifiedEmailCookie, email)) {
            return NextResponse.json(
                { error: "Verify the email first before submitting the form." },
                { status: 403 }
            );
        }

        try {
            await pool.query(
                `INSERT INTO contacts (name, email, message, created_at) VALUES ($1, $2, $3, NOW())`,
                [name, email, message]
            );
        } catch (dbError) {
            console.error("Postgres insert failed, retrying via Supabase REST:", dbError);
            await insertContactViaSupabase(name, email, message);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form submission failed:", error);
        const debugError = request.headers.get("x-debug-contact-error") === "1"
            ? error instanceof Error
                ? error.message
                : String(error)
            : null;

        return NextResponse.json(
            {
                error: "Unable to save your message right now. Please try again.",
                debugError,
            },
            { status: 500 }
        );
    }
}