"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatDate, type AdminUser } from "@/lib/admin";
import { Badge, EmptyState, fieldClass } from "@/components/admin/ui";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"ALL" | "ADMIN" | "CUSTOMER">("ALL");

  useEffect(() => {
    void api<AdminUser[]>("/v1/admin/users").then(setUsers);
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (role !== "ALL" && u.role !== role) return false;
      if (q && !u.phone.includes(q) && !u.profiles.some((p) => p.name.toLowerCase().includes(q.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [users, q, role]);

  if (!users) return <p className="text-sm text-muted">Уншиж байна…</p>;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">{filtered.length} хэрэглэгч</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className={fieldClass}
          placeholder="Утас эсвэл нэр…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldClass} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="ALL">Бүх эрх</option>
          <option value="ADMIN">Админ</option>
          <option value="CUSTOMER">Хэрэглэгч</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Хэрэглэгч олдсонгүй" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/6">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Хэрэглэгч</th>
                <th className="px-4 py-3 font-medium">Эрх</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Premium</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Бүртгүүлсэн</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const name = u.profiles.find((p) => p.isDefault)?.name ?? u.profiles[0]?.name ?? "—";
                const sub = u.subscriptions[0];
                const premium = sub?.status === "ACTIVE";
                return (
                  <tr key={u.id} className="border-t border-white/6">
                    <td className="px-4 py-3">
                      <p className="font-medium">{name}</p>
                      <p className="text-xs text-muted">{u.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.role === "ADMIN" ? "pink" : "neutral"}>
                        {u.role === "ADMIN" ? "Админ" : "Хэрэглэгч"}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Badge tone={premium ? "green" : "neutral"}>{premium ? "Идэвхтэй" : "Байхгүй"}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-muted lg:table-cell">{formatDate(u.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
