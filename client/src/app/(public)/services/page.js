"use client";

import Card from "@/components/Card";
import CategoryCard from "@/components/CategoryCard";
import { useState } from "react";

export default function ServicesPage() {
  const [form, setForm] = useState({
    where: "",
    when: "",
    type: "",
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="bg-white shadow rounded-xl p-4 grid grid-cols-4 gap-4">
          <input
            placeholder="Where (Toronto)"
            className="border rounded-lg px-4 py-3"
            value={form.where}
            onChange={(e) => setForm({ ...form, where: e.target.value })}
          />

          <input
            placeholder="When (Tomorrow 2PM)"
            className="border rounded-lg px-4 py-3"
            value={form.when}
            onChange={(e) => setForm({ ...form, when: e.target.value })}
          />

          <input
            placeholder="Type (Plumber)"
            className="border rounded-lg px-4 py-3"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />

          <button className="bg-black text-white rounded-lg">Search</button>
        </div>
      </div>

      <div className="space-y-10">

        <section>
          <h1 className="text-xl font-semibold">Services in Toronto</h1>
           <div className="mt-4 flex justify-center gap-6 flex-wrap">
            <CategoryCard/>
            <CategoryCard/>
          </div>

        </section>
        <section>
          <h1 className="text-xl font-semibold">Photography </h1>

          <div className="mt-4 flex justify-center gap-6 flex-wrap">
            <Card />
            <Card />
          </div>
        </section>
        <section>
          <h1 className="text-xl font-semibold">Chefs</h1>

          <div className="mt-4 flex justify-center gap-6 flex-wrap">
            <Card />
            <Card />
          </div>
        </section>
      </div>
    </main>
  );
}
