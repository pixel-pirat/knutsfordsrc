import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { getSellerInventory } from "@/db/listingQueries";
import { canManageStore } from "@/lib/sellerGuard";
import { SellerNav } from "../SellerNav";
import { InventoryClient } from "./InventoryClient";

export default async function StoreInventoryPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  const products = await getSellerInventory(store.id);

  return (
    <div>
      <SellerNav />
      <InventoryClient
        products={products}
        canManage={canManageStore(store.status)}
      />
    </div>
  );
}
