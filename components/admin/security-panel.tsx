"use client";

import { SecurityFormClient } from "@/components/admin/security-form-client";
import { AdminUsersManager } from "@/components/admin/admin-users-manager";
import { ADMIN_ROLE_LABELS } from "@/lib/auth/roles";
import type { AdminCapabilities } from "@/lib/auth/capabilities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SecurityPanelProps = {
  saveToken: string;
  capabilities: AdminCapabilities;
  currentUserId: number;
  currentUsername: string;
};

export function SecurityPanel({
  saveToken,
  capabilities,
  currentUserId,
  currentUsername,
}: SecurityPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tu sesión</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <span className="font-medium">{currentUsername}</span>
          <Badge>{ADMIN_ROLE_LABELS[capabilities.role]}</Badge>
          {capabilities.readOnly && (
            <span className="text-sm text-[#666]">
              Modo solo lectura: puedes ver el panel pero no modificar nada.
            </span>
          )}
        </CardContent>
      </Card>

      <AdminUsersManager
        capabilities={capabilities}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
      />

      <SecurityFormClient
        saveToken={saveToken}
        readOnly={capabilities.readOnly}
        currentUserId={currentUserId}
        usersTokenAvailable={capabilities.canResetPasswords}
      />
    </div>
  );
}
