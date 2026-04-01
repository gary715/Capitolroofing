import { auth } from "./auth";
import type { UserRole } from "./auth-types";

const ROLE_LEVELS: Record<UserRole, number> = {
  admin: 4,
  estimator: 3,
  foreman: 2,
  viewer: 1,
};

export async function requireRole(minRole: UserRole) {
  const session = await auth();
  if (!session?.user) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  const userRole = (session.user.role ?? "viewer") as UserRole;
  if (ROLE_LEVELS[userRole] < ROLE_LEVELS[minRole]) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}
