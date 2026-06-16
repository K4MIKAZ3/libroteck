"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ADMIN_ROLE_LABELS,
  canResetUserPassword,
  type AdminRole,
} from "@/lib/auth/roles";
import type { AdminCapabilities } from "@/lib/auth/capabilities";

type AdminUserRow = {
  id: number;
  username: string;
  role: AdminRole;
  isActive: boolean;
};

type AdminUsersManagerProps = {
  capabilities: AdminCapabilities;
  currentUserId: number;
  currentUsername: string;
};

export function AdminUsersManager({
  capabilities,
  currentUserId,
  currentUsername,
}: AdminUsersManagerProps) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersToken, setUsersToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"privileged" | "viewer">("viewer");
  const [creating, setCreating] = useState(false);
  const [passwordDrafts, setPasswordDrafts] = useState<
    Record<number, { newPassword: string; confirmPassword: string }>
  >({});

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/admin/users", {
          credentials: "same-origin",
        });
        const data = (await response.json()) as {
          users?: AdminUserRow[];
          token?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "No se pudieron cargar los usuarios");
        }

        setUsers(data.users ?? []);
        setUsersToken(data.token ?? "");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Error al cargar usuarios",
        );
      } finally {
        setLoading(false);
      }
    }

    if (capabilities.canResetPasswords || capabilities.canManageUsers) {
      void loadUsers();
    } else {
      setLoading(false);
    }
  }, [capabilities.canManageUsers, capabilities.canResetPasswords]);

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          username,
          password,
          role,
          _token: usersToken,
        }),
      });

      const data = (await response.json()) as {
        user?: AdminUserRow;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo crear el usuario");
      }

      if (data.user) {
        setUsers((current) => [...current, data.user!]);
      }

      setUsername("");
      setPassword("");
      setRole("viewer");
      setFeedback("Usuario creado correctamente.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo crear el usuario",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(user: AdminUserRow) {
    if (!confirm(`¿Eliminar al usuario ${user.username}?`)) {
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ _token: usersToken }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setFeedback(data.error ?? "No se pudo eliminar el usuario");
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== user.id));
  }

  async function handleResetPassword(user: AdminUserRow) {
    const draft = passwordDrafts[user.id];
    if (!draft?.newPassword) {
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        newPassword: draft.newPassword,
        confirmPassword: draft.confirmPassword,
        _token: usersToken,
      }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setFeedback(data.error ?? "No se pudo cambiar la contraseña");
      return;
    }

    setPasswordDrafts((current) => {
      const next = { ...current };
      delete next[user.id];
      return next;
    });
    setFeedback(`Contraseña actualizada para ${user.username}.`);
  }

  if (!capabilities.canResetPasswords && !capabilities.canManageUsers) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {feedback && <p className="text-sm text-[#555]">{feedback}</p>}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#666]">
            <Loader2 className="size-4 animate-spin" />
            Cargando usuarios…
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-[var(--border)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {user.username}
                      {user.username === currentUsername && (
                        <span className="ml-2 text-sm font-normal text-[#666]">
                          (tú)
                        </span>
                      )}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {ADMIN_ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                  {capabilities.canManageUsers && user.role !== "superadmin" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </Button>
                  )}
                </div>

                {(user.id !== currentUserId &&
                  canResetUserPassword(capabilities.role, user.role)) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={passwordDrafts[user.id]?.newPassword ?? ""}
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [user.id]: {
                              newPassword: event.target.value,
                              confirmPassword:
                                current[user.id]?.confirmPassword ?? "",
                            },
                          }))
                        }
                      />
                      <Input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={passwordDrafts[user.id]?.confirmPassword ?? ""}
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [user.id]: {
                              newPassword: current[user.id]?.newPassword ?? "",
                              confirmPassword: event.target.value,
                            },
                          }))
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="sm:col-span-2"
                        onClick={() => handleResetPassword(user)}
                      >
                        Cambiar contraseña de {user.username}
                      </Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {capabilities.canManageUsers && (
          <form onSubmit={handleCreateUser} className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <UserPlus className="size-4" />
              Crear usuario
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-username">Usuario</Label>
                <Input
                  id="new-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  minLength={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Contraseña</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as "privileged" | "viewer")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privileged">Privilegiado</SelectItem>
                    <SelectItem value="viewer">Solo lectura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="size-4 animate-spin" />}
              Crear usuario
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
