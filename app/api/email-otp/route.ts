import { NextResponse } from "next/server";
import crypto from "node:crypto";

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getVerificationSecret() {
  return process.env.EMAIL_VERIFICATION_SECRET || process.env.SUPABASE_ANON_KEY || "fallback-verification-secret";
}

function signEmail(email: string) {
  return crypto
    .createHmac("sha256", getVerificationSecret())
    .update(email)
    .digest("base64url");
}

function buildVerifiedEmailCookie(email: string) {
  return `${email}::${signEmail(email)}`;
}

export async function POST(request: Request) {
  const config = getSupabaseConfig();

  if (!config) {
    return NextResponse.json(
      {
        error:
          "Missing SUPABASE_URL or SUPABASE_ANON_KEY in your environment file.",
      },
      { status: 500 },
    );
  }

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const action = typeof body.action === "string" ? body.action : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (action === "send") {
    const response = await fetch(`${config.supabaseUrl}/auth/v1/otp`, {
      method: "POST",
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        create_user: true,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error_description || data.msg || data.error || "Failed to send code.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true });
  }

  if (action === "verify") {
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ error: "Code is required." }, { status: 400 });
    }

    const response = await fetch(`${config.supabaseUrl}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        token,
        type: "email",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error_description || data.msg || data.error || "Failed to verify code.",
        },
        { status: response.status },
      );
    }

    const nextResponse = NextResponse.json({ success: true });
    nextResponse.cookies.set("verified_email", buildVerifiedEmailCookie(email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
    });

    return nextResponse;
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}