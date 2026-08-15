"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClass } from "@/components/FormField";
import { PERMISSIONS } from "@/lib/permissions";
import { adminCreateSchema } from "@/lib/validation";

type AdminRow = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  permissions: string[];
  active: boolean;
  createdAt: string;
};

export function AdminsManager({ initialAdmins }: { initialAdmins: AdminRow[] }) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function togglePermission(key: string) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = adminCreateSchema.safeParse({ name, email, password, permissions });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setAdmins((prev) => [{ ...data.admin, createdAt: new Date().toISOString() }, ...prev]);
      setName("");
      setEmail("");
      setPassword("");
      setPermissions([]);
      setShowForm(false);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(admin: AdminRow) {
    setTogglingId(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !admin.active }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, active: data.admin.active } : a))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Admins</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage sub-admin accounts and what they can do
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          {showForm ? "Cancel" : "New Admin"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-7"
        >
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            NEW ADMIN ACCOUNT
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" htmlFor="adminName" error={fieldErrors.name}>
              <input
                id="adminName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Email" htmlFor="adminEmail" error={fieldErrors.email}>
              <input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField
              label="Temporary Password"
              htmlFor="adminPassword"
              error={fieldErrors.password}
              hint="At least 8 characters — share this with them to sign in"
            >
              <input
                id="adminPassword"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Permissions</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PERMISSIONS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-start gap-2.5 rounded-lg border border-black/10 p-3 text-sm hover:bg-black/5"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(p.key)}
                    onChange={() => togglePermission(p.key)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block font-medium text-ink">{p.label}</span>
                    <span className="block text-xs text-neutral-500">
                      {p.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formError && (
            <p className="mt-4 rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Admin"}
          </button>
        </form>
      )}

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{a.name}</p>
                    <p className="text-xs text-neutral-400">{a.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700 capitalize">
                    {a.role.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {a.role === "super_admin"
                      ? "All permissions"
                      : a.permissions.length > 0
                        ? a.permissions.join(", ")
                        : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        a.active
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {a.active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {a.role !== "super_admin" && (
                      <button
                        type="button"
                        onClick={() => toggleActive(a)}
                        disabled={togglingId === a.id}
                        className="text-xs font-semibold text-gold-dark hover:underline disabled:opacity-60"
                      >
                        {a.active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
