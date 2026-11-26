import { Account, Client } from "node-appwrite";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieName = getAdminSessionCookieName();
  const cookieStore = await cookies();
  const session = cookieStore.get(cookieName)?.value;

  if (session) {
    try {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

      if (!endpoint || !projectId) {
        throw new Error("Appwrite configuration is missing.");
      }

      const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setSession(session);

      const account = new Account(client);

      await account.deleteSession({
        sessionId: "current",
      });
    } catch (error) {
      console.error("ADMIN LOGOUT ERROR:", error);
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
