"use client";

import { useState } from "react";
import Image from "next/image";
import { StarIcon } from "./icons";
import type { Product } from "@/data/site";

export function MarketGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2.5">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "border-gold bg-gold text-ink"
                : "border-black/10 bg-white text-neutral-600 hover:border-gold/50 hover:text-ink"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {filtered.map((product, i) => (
          <div key={product.name + i}>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-black/5">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <span className="mt-3 block text-xs font-semibold uppercase tracking-wide text-gold-dark">
              {product.category}
            </span>
            <h3 className="text-sm font-semibold text-ink sm:text-base">
              {product.name}
            </h3>
            <p className="text-sm font-bold text-ink">{product.price}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 sm:text-sm">
              <StarIcon className="h-3.5 w-3.5 text-gold" />
              <span>{product.rating}</span>
              <span>({product.reviews})</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-neutral-500">
          No listings in this category yet.
        </p>
      )}
    </div>
  );
}
