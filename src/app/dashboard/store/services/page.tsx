import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { listStoreServices } from "@/db/listingQueries";
import { canManageStore } from "@/lib/sellerGuard";
import { SellerNav } from "../SellerNav";
import { ServicesClient } from "./ServicesClient";

export default async function StoreServicesPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  const services = await listStoreServices(store.id);

  return (
    <div>
      <SellerNav />
      <ServicesClient services={services} canManage={canManageStore(store.status)} />
    </div>
  );
}
