import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { listStoreProducts } from "@/db/listingQueries";
import { canManageStore } from "@/lib/sellerGuard";
import { SellerNav } from "../SellerNav";
import { ProductsClient } from "./ProductsClient";

export default async function StoreProductsPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  const products = await listStoreProducts(store.id);

  return (
    <div>
      <SellerNav />
      <ProductsClient
        products={products}
        canManage={canManageStore(store.status)}
        defaultFulfilmentMethods={store.fulfilmentMethods}
      />
    </div>
  );
}
