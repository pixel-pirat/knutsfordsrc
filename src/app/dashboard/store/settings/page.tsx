import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { SellerNav } from "../SellerNav";
import { StoreForm } from "../StoreForm";
import { StoreSummary } from "../StoreSummary";

export default async function StoreSettingsPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  return (
    <div>
      <SellerNav />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Store settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Manage your storefront profile and contact details
        </p>
      </div>

      <div className="space-y-6">
        <StoreSummary store={store} />
        {store.status === "active" || store.status === "inactive" ? (
          <StoreForm
            mode="edit"
            store={store}
            student={{
              firstName: student.firstName,
              lastName: student.lastName,
              indexNumber: student.indexNumber,
              email: student.email,
              phone: student.phone,
              program: student.program,
              level: student.level,
            }}
          />
        ) : (
          <p className="rounded-2xl bg-white px-4 py-6 text-sm text-neutral-500 ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-white/10">
            Store settings cannot be edited while the store is{" "}
            {store.status}. Contact the SRC marketplace team for help.
          </p>
        )}
      </div>
    </div>
  );
}
