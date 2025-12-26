export default function Card() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
          Service
        </span>
        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:bg-white"
          aria-label="Save"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.8 4.6c-1.6-1.6-4.2-1.6-5.8 0l-1 1-1-1c-1.6-1.6-4.2-1.6-5.8 0s-1.6 4.2 0 5.8l6.8 6.8 6.8-6.8c1.6-1.6 1.6-4.2 0-5.8z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">
              iPhone Screen Repair (Same Day)
            </h3>
            <p className="mt-1 truncate text-sm text-gray-600">
              Scarborough, Toronto • 2.5 km away
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-semibold text-gray-900">$35</p>
            <p className="text-xs text-gray-600">per hour</p>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4 text-gray-800"
            fill="currentColor"
          >
            <path d="M10 15.27l-5.18 2.73 1-5.82L1.64 7.64l5.84-.85L10 1.5l2.52 5.29 5.84.85-4.18 4.54 1 5.82z" />
          </svg>
          <span className="font-medium">4.8</span>
          <span className="text-gray-500">(126 reviews)</span>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Verified
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Instant booking
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Top rated
          </span>
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            View details
          </button>
          <button
            type="button"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
          >
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
