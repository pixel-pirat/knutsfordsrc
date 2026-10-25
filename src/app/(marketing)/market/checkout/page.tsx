import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/market/CheckoutClient";
import { getCurrentStudent } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | Knutsford Marketplace",
  description: "Confirm your details and place your marketplace order.",
};

export default async function MarketplaceCheckoutPage() {
  const student = await getCurrentStudent();
  if (!student) {
    redirect(`/login?next=${encodeURIComponent("/market/checkout")}`);
  }

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <CheckoutClient
          student={{
            firstName: student.firstName,
            lastName: student.lastName,
            indexNumber: student.indexNumber,
            phone: student.phone,
            email: student.email,
          }}
        />
      </div>
    </section>
  );
}
