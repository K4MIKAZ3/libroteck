import bcrypt from "bcryptjs";
import { and, asc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import type { AdminRole } from "@/lib/auth/roles";
import { getStoreSlugFromRequest } from "@/lib/store/context";
import { getDb } from "./index";
import { adminUsers, stores, type AdminUser } from "./schema";

export async function getStoreIdForRequest(request?: Request) {
  const db = await getDb();

  if (request) {
    const slug = getStoreSlugFromRequest(request);
    const store = await db.query.stores.findFirst({
      where: eq(stores.slug, slug),
    });
    if (!store) {
      throw new Error(`Tienda no encontrada: ${slug}`);
    }
    return store.id;
  }

  const { getStoreContext } = await import("@/lib/store/context");
  const { storeId } = await getStoreContext();
  return storeId;
}

export async function listAdminUsers(request?: Request) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);

  return db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.storeId, storeId))
    .orderBy(asc(adminUsers.username));
}

export async function getAdminUserById(id: number, request?: Request) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);

  return db.query.adminUsers.findFirst({
    where: and(eq(adminUsers.id, id), eq(adminUsers.storeId, storeId)),
  });
}

export async function getAdminUserByUsername(
  username: string,
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);

  return db.query.adminUsers.findFirst({
    where: and(
      eq(adminUsers.storeId, storeId),
      eq(adminUsers.username, username.trim().toLowerCase()),
    ),
  });
}

export async function verifyAdminUserPassword(
  username: string,
  password: string,
  request?: Request,
) {
  const user = await getAdminUserByUsername(username, request);
  if (!user?.isActive) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? user : null;
}

export async function createAdminUser(
  input: {
    username: string;
    password: string;
    role: AdminRole;
  },
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);
  const username = input.username.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);

  const [created] = await db
    .insert(adminUsers)
    .values({
      storeId,
      username,
      passwordHash,
      role: input.role,
      isActive: true,
    })
    .returning();

  return created;
}

export async function updateAdminUser(
  id: number,
  input: {
    role?: AdminRole;
    isActive?: boolean;
  },
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);

  const [updated] = await db
    .update(adminUsers)
    .set(input)
    .where(and(eq(adminUsers.id, id), eq(adminUsers.storeId, storeId)))
    .returning();

  return updated ?? null;
}

export async function updateAdminUserPassword(
  id: number,
  newPassword: string,
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const [updated] = await db
    .update(adminUsers)
    .set({ passwordHash })
    .where(and(eq(adminUsers.id, id), eq(adminUsers.storeId, storeId)))
    .returning();

  return updated ?? null;
}

export async function deleteAdminUser(id: number, request?: Request) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);

  const [deleted] = await db
    .delete(adminUsers)
    .where(and(eq(adminUsers.id, id), eq(adminUsers.storeId, storeId)))
    .returning();

  return deleted ?? null;
}

export function toPublicAdminUser(user: AdminUser) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
