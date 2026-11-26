import { Account, Client } from "node-appwrite";
import { cookies } from "next/headers";

const SESSION_COOKIE = "joshua_portfolio_admin_session";

function getAppwriteClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error("Appwrite configuration is missing.");
  }

  return new Client().setEndpoint(endpoint).setProject(projectId);
}

export function getAdminSessionCookieName() {
  return SESSION_COOKIE;
}

export async function getAdminAccount() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  console.log("[ADMIN AUTH] Session cookie present:", Boolean(session));

  if (!session) {
    console.log("[ADMIN AUTH] No session cookie found.");
    return null;
  }

  try {
    const client = getAppwriteClient().setSession(session);
    const account = new Account(client);

    const user = await account.get();

    const allowedEmail = process.env.APPWRITE_ADMIN_EMAIL?.trim().toLowerCase();

    const authenticatedEmail = user.email?.trim().toLowerCase();

    console.log("[ADMIN AUTH] Appwrite session validated:", true);
    console.log(
      "[ADMIN AUTH] Authorized email matches:",
      authenticatedEmail === allowedEmail,
    );

    if (!allowedEmail || authenticatedEmail !== allowedEmail) {
      console.error("[ADMIN AUTH] Account is not authorized.");
      return null;
    }

    return user;
  } catch (error) {
    const appwriteError = error as {
      message?: string;
      code?: number;
      type?: string;
    };

    console.error("[ADMIN AUTH] Session validation failed.");
    console.error("[ADMIN AUTH] Error code:", appwriteError.code);
    console.error("[ADMIN AUTH] Error type:", appwriteError.type);
    console.error("[ADMIN AUTH] Error message:", appwriteError.message);

    return null;
  }
}

export async function requireAdmin() {
  const user = await getAdminAccount();

  if (!user) {
    throw new Error("Unauthorized. Please sign in.");
  }

  return user;
}
