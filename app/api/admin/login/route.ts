import { Account, Client } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const normalizedEmail = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    const allowedEmail = process.env.APPWRITE_ADMIN_EMAIL?.trim().toLowerCase();

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    // Validate configuration
    if (!allowedEmail || !endpoint || !projectId || !apiKey) {
      console.error("[ADMIN LOGIN] Missing server configuration.");

      return NextResponse.json(
        {
          success: false,
          message: "Server configuration is incomplete.",
        },
        { status: 500 },
      );
    }

    // Restrict access to the authorized administrator
    if (!normalizedEmail || normalizedEmail !== allowedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is not authorized to access this workspace.",
        },
        { status: 403 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your password.",
        },
        { status: 400 },
      );
    }

    // Initialize Appwrite server client with API key
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const account = new Account(client);

    // Authenticate administrator credentials
    const session = await account.createEmailPasswordSession({
      email: normalizedEmail,
      password,
    });

    // Verify that Appwrite returned a usable session secret
    console.log("[ADMIN LOGIN] Session created:", {
      hasSessionId: Boolean(session.$id),
      hasUserId: Boolean(session.userId),
      hasSecret: Boolean(session.secret),
    });

    if (!session.secret) {
      console.error("[ADMIN LOGIN] Session secret is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Unable to establish a secure login session.",
        },
        { status: 500 },
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
    });

    // Store session secret in an HTTP-only cookie
    response.cookies.set(getAdminSessionCookieName(), session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expire),
    });

    console.log("[ADMIN LOGIN] Secure session cookie attached.");

    return response;
  } catch (error: unknown) {
    const appwriteError = error as {
      message?: string;
      code?: number;
      type?: string;
    };

    console.error("[ADMIN LOGIN] Authentication failed:", {
      code: appwriteError.code,
      type: appwriteError.type,
      message: appwriteError.message,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          appwriteError.message || "Unable to sign in. Please try again.",
      },
      { status: appwriteError.code || 401 },
    );
  }
}
