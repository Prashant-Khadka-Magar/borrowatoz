"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetListingByIdQuery } from "@/state/listingApi";
import { useCreateRentalRequestMutation } from "@/state/requestRentalApi";

export default function CreateRentalRequestPage() {
  const params = useParams();
  const router = useRouter();

  const listingId = params?.id;

  const { data, isLoading } = useGetListingByIdQuery(listingId);

  const [createRentalRequest, { isLoading: isSubmitting }] =
    useCreateRentalRequestMutation();

  const listing = data?.listing;

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    guestCount: 1,
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-600">
        Loading listing...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 text-red-600">
        Listing not found
      </div>
    );
  }

  const isService = listing.type === "SERVICE";
  const isPerGuest = listing.billingUnit === "PER_GUEST";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      const payload = {
        listingId,
        startDate: form.startDate,
        endDate: form.endDate,
        message: form.message,
      };

      if (isService && isPerGuest) {
        payload.guestCount = Number(form.guestCount);
      }

      const res = await createRentalRequest(payload).unwrap();

      setSuccess(res.message || "Request submitted successfully");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err) {
      setError(err?.data?.message || "Failed to submit request");
    }
  };



  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">

        <h1 className="text-2xl font-semibold text-gray-900">
          {isService ? "Request Service Booking" : "Request Tool Rental"}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          {listing.title}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          {isService && isPerGuest && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Guest Count
              </label>

              <input
                type="number"
                min="1"
                value={form.guestCount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    guestCount: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>

            <textarea
              rows="4"
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="Add any details..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-black py-3 text-white font-semibold"
          >
            {isSubmitting
              ? "Submitting..."
              : isService
              ? "Request Booking"
              : "Request Rental"}
          </button>

        </form>
      </div>
    </main>
  );
}