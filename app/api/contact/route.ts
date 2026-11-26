import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { tablesDB } from "@/lib/appwrite-server";

export const runtime = "nodejs";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = "contact_messages";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Please complete all fields." },
        { status: 400 },
      );
    }

    if (name.length > 120) {
      return NextResponse.json(
        { success: false, error: "Name is too long." },
        { status: 400 },
      );
    }

    if (email.length > 254 || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Message is too long." },
        { status: 400 },
      );
    }

    if (!databaseId) {
      throw new Error("APPWRITE_DATABASE_ID is missing.");
    }

    const createdRow = await tablesDB.createRow({
      databaseId,
      tableId,
      rowId: ID.unique(),
      data: {
        name,
        email,
        message,
        status: "UNREAD",
        createdAt: new Date().toISOString(),
      },
    });

    console.log("CONTACT MESSAGE SAVED:", createdRow.$id);

    return NextResponse.json({
      success: true,
      message: "Your message has been saved successfully.",
    });
  } catch (error) {
    console.error("CONTACT MESSAGE SAVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to save your message. Please try again.",
      },
      { status: 500 },
    );
  }
}
