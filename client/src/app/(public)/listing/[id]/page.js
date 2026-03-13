"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetListingByIdQuery } from "@/state/listingApi";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/state/redux";

function formatPrice(price) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function formatEnum(value = "") {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ListingDetailSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="space-y-4">
            <div className="h-[430px] rounded-3xl bg-gray-200" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-24 rounded-2xl bg-gray-200" />
              <div className="h-24 rounded-2xl bg-gray-200" />
              <div className="h-24 rounded-2xl bg-gray-200" />
              <div className="h-24 rounded-2xl bg-gray-200" />
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="h-8 w-2/3 rounded bg-gray-200" />
              <div className="mt-4 h-4 w-1/2 rounded bg-gray-200" />
              <div className="mt-6 h-24 rounded bg-gray-200" />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="h-8 w-1/2 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              <div className="h-12 rounded-xl bg-gray-200" />
              <div className="h-12 rounded-xl bg-gray-200" />
              <div className="h-12 rounded-xl bg-gray-200" />
              <div className="h-12 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ErrorState({ title, message }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-600">{message}</p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">
        {value || "—"}
      </span>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id;

  const { data, isLoading, isError, error } = useGetListingByIdQuery(id, {
    skip: !id,
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const listing = data?.listing;

  const router = useRouter();

  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAppSelector((state) => state.auth);

  const handleRequestClick = () => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    router.push(`/rental-request/${id}`);
  };

  if (!id) {
    return <ErrorState title="Invalid listing" message="Missing id" />;
  }

  if (isLoading) {
    return <ListingDetailSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load listing"
        message={error?.data?.message || "Error loading listing"}
      />
    );
  }

  if (!listing) {
    return <ErrorState title="Listing not found" message="No listing found" />;
  }

  const isService = listing.type === "SERVICE";
  const backHref = isService ? "/services" : "/tools";

  const images =
    listing.images?.length > 0
      ? listing.images
      : [{ url: "/next.svg", publicId: "fallback-image" }];

  const safeSelectedIndex =
    selectedImageIndex >= images.length ? 0 : selectedImageIndex;

  const selectedImage = images[safeSelectedIndex];

  const ownerName =
    `${listing?.owner?.firstName || ""} ${
      listing?.owner?.lastName || ""
    }`.trim() || "Unknown owner";

  const priceLabel = `${formatPrice(listing.price)} / ${formatEnum(
    listing.billingUnit,
  ).toLowerCase()}`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href={backHref}
            className="text-sm font-medium text-gray-600 transition hover:text-black"
          >
            ← Back to {isService ? "services" : "tools"}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-sm">
              <div className="relative h-[430px] overflow-hidden rounded-2xl bg-gray-100">
                <Image
                  src={selectedImage?.url || "/next.svg"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={image.publicId || `${image.url}-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-24 overflow-hidden rounded-2xl border-2 transition ${
                        safeSelectedIndex === index
                          ? "border-black"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  {isService ? "Service" : "Tool"}
                </span>

                {listing.category?.name ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {listing.category.name}
                  </span>
                ) : null}

                {listing.deliveryMode ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {formatEnum(listing.deliveryMode)}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
                {listing.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>{listing.city || "Unknown city"}</span>
                <span>•</span>
                <Link
                  href={`/profile/${listing.owner?._id}`}
                  className="font-bold text-blue-600  hover:text-black underline"
                >
                  {ownerName}
                </Link>
                <span>•</span>
                <span>
                  ⭐ {Number(listing.avgRating || 0).toFixed(1)} (
                  {listing.ratingCount || 0} reviews)
                </span>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
                  {listing.description || "No description available."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {priceLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm text-gray-500">Billing Unit</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatEnum(listing.billingUnit)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm text-gray-500">Delivery Mode</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {listing.deliveryMode
                      ? formatEnum(listing.deliveryMode)
                      : "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {listing.category?.name || "General"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-3xl font-semibold text-gray-900">
              {formatPrice(listing.price)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              per {formatEnum(listing.billingUnit).toLowerCase()}
            </p>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h2 className="text-base font-semibold text-gray-900">
                {isService ? "Book this service" : "Request this tool"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {isService
                  ? "Choose your date and send a booking request to the provider."
                  : "Check availability and send a rental request to the owner."}
              </p>
            </div>

            <div className="mt-6">
              <InfoRow label="Type" value={isService ? "Service" : "Tool"} />
              <InfoRow label="Owner" value={ownerName} />
              <InfoRow label="City" value={listing.city} />
              <InfoRow
                label="Category"
                value={listing.category?.name || "General"}
              />
              <InfoRow
                label="Delivery"
                value={
                  listing.deliveryMode
                    ? formatEnum(listing.deliveryMode)
                    : "Not specified"
                }
              />
            </div>

            <button
              type="button"
              onClick={handleRequestClick}
              disabled={authLoading}
              className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {authLoading
                ? "Loading..."
                : isService
                  ? "Book Service"
                  : "Request Tool"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
