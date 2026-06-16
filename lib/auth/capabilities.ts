import {
  roleHasPermission,
  type AdminRole,
} from "@/lib/auth/roles";

export function getAdminCapabilities(role: AdminRole) {
  return {
    role,
    canWriteProducts: roleHasPermission(role, "products:write"),
    canWriteSettings: roleHasPermission(role, "settings:write"),
    canWriteHero: roleHasPermission(role, "hero:write"),
    canManageUsers: roleHasPermission(role, "users:manage"),
    canResetPasswords: roleHasPermission(role, "users:password"),
    readOnly: role === "viewer",
  };
}

export type AdminCapabilities = ReturnType<typeof getAdminCapabilities>;
