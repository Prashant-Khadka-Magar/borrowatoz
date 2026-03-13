"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ activeTab }) {
  const router = useRouter();

  const [serviceForm, setServiceForm] = useState({
    where: "",
    when: "",
    type: "",
  });

  const [toolForm, setToolForm] = useState({
    where: "",
    when: "",
    what: "",
  });

  const currentForm = useMemo(() => {
    return activeTab === "SERVICE" ? serviceForm : toolForm;
  }, [activeTab, serviceForm, toolForm]);

  const handleChange = (field, value) => {
    if (activeTab === "SERVICE") {
      setServiceForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setToolForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    params.set("listingType", activeTab);

    if (currentForm.where.trim()) {
      params.set("city", currentForm.where.trim().toLowerCase());
    }

    if (activeTab === "SERVICE") {
      if (currentForm.type.trim()) {
        params.set("q", currentForm.type.trim());
      }
      if (currentForm.when.trim()) {
        params.set("when", currentForm.when.trim());
      }
    }

    if (activeTab === "ITEM") {
      if (currentForm.what.trim()) {
        params.set("q", currentForm.what.trim());
      }
      if (currentForm.when.trim()) {
        params.set("when", currentForm.when.trim());
      }
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="border-b bg-white">
     
    </section>
  );
}