export const ADMIN_ROLES = ["superadmin", "privileged", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminPermission =
  | "admin:access"
  | "products:read"
  | "products:write"
  | "settings:read"
  | "settings:write"
  | "hero:write"
  | "users:manage"
  | "users:password";

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  superadmin: [
    "admin:access",
    "products:read",
    "products:write",
    "settings:read",
    "settings:write",
    "hero:write",
    "users:manage",
    "users:password",
  ],
  privileged: [
    "admin:access",
    "products:read",
    "products:write",
    "settings:read",
    "hero:write",
    "users:password",
  ],
  viewer: ["admin:access", "products:read", "settings:read"],
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Superusuario",
  privileged: "Privilegiado",
  viewer: "Solo lectura",
};

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return ADMIN_ROLES.includes(value as AdminRole);
}

export function roleHasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canResetUserPassword(
  actorRole: AdminRole,
  targetRole: AdminRole,
): boolean {
  if (targetRole === "superadmin") {
    return actorRole === "superadmin";
  }

  return roleHasPermission(actorRole, "users:password");
}
