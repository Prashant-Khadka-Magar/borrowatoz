client/
├── app/
│   ├── layout.js
│   ├── page.js                      # Landing page
│   ├── globals.css                  # Tailwind imports + global styles
│   ├── loading.js
│   ├── not-found.js
│   │
│   ├── (public)/
│   │   ├── items/
│   │   │   ├── page.js              # Browse listings
│   │   │   └── [id]/
│   │   │       └── page.js          # Item details
│   │   ├── lenders/
│   │   │   └── [id]/page.js         # Lender profile (public)
│   │   └── search/
│   │       └── page.js
│   │
│   ├── (auth)/
│   │   ├── login/page.js
│   │   ├── register/page.js
│   │   └── verify-otp/page.js       # if you use OTP
│   │
│   ├── (protected)/
│   │   ├── dashboard/page.js
│   │   ├── my-items/
│   │   │   ├── page.js              # My listings
│   │   │   ├── new/page.js          # Create listing
│   │   │   └── [id]/edit/page.js
│   │   ├── rentals/
│   │   │   ├── page.js              # My rentals (borrower)
│   │   │   └── [id]/page.js
│   │   ├── requests/
│   │   │   ├── page.js              # Incoming requests (lender)
│   │   │   └── [id]/page.js
│   │   ├── messages/page.js         # Chat inbox
│   │   ├── profile/page.js
│   │   └── settings/page.js
│   │
│   └── providers.js                 # Redux Provider (client component)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── Sidebar.js
│   │   └── ProtectedShell.js        # wraps protected pages UI
│   │
│   ├── ui/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Modal.js
│   │   ├── Spinner.js
│   │   ├── Badge.js
│   │   └── Toast.js
│   │
│   ├── items/
│   │   ├── ItemCard.js
│   │   ├── ItemFilters.js
│   │   ├── ItemGallery.js
│   │   └── ItemForm.js
│   │
│   ├── rentals/
│   │   ├── RentalCard.js
│   │   ├── RequestCard.js
│   │   └── StatusPill.js
│   │
│   └── auth/
│       ├── LoginForm.js
│       ├── RegisterForm.js
│       └── OtpForm.js
│
├── redux/
│   ├── store.js
│   ├── hooks.js                     # useAppDispatch/useAppSelector (JS version)
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── itemsSlice.js
│   │   ├── rentalsSlice.js
│   │   ├── requestsSlice.js
│   │   ├── chatSlice.js
│   │   └── uiSlice.js
│   └── thunks/
│       ├── authThunks.js
│       ├── itemsThunks.js
│       ├── rentalsThunks.js
│       ├── requestsThunks.js
│       └── chatThunks.js
│
├── lib/
│   ├── api/
│   │   ├── http.js                   # axios instance (baseURL, interceptors)
│   │   ├── endpoints.js              # routes constants
│   │   └── token.js                  # get/set token (cookie/localStorage)
│   ├── validators/
│   │   └── clientValidators.js       # simple validation helpers
│   └── utils/
│       ├── cn.js                     # classnames helper (optional)
│       ├── format.js                 # date, money formatting
│       └── guards.js                 # auth checks
│
├── hooks/
│   ├── useAuth.js                    # reads auth from redux + helpers
│   ├── useDebounce.js
│   └── usePagination.js
│
├── styles/
│   └── tailwind.css                  # optional if you prefer separate file
│
├── public/
│   ├── images/
│   └── icons/
│
├── middleware.js                     # protect (protected) routes (optional)
├── .env.local                        # NEXT_PUBLIC_API_URL=...
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── package.json







server/
├── src/
│   ├── app.js                      # express app config
│   ├── server.js                   # listen() + boot
│   ├── config/
│   │   ├── db.js                   # mongoose connect
│   │   ├── env.js                  # env validation
│   │   └── cors.js
│   │
│   ├── routes/
│   │   ├── index.routes.js
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── items.routes.js
│   │   ├── rentals.routes.js       # requests + approvals + statuses
│   │   ├── reviews.routes.js
│   │   ├── messages.routes.js
│   │   └── uploads.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── items.controller.js
│   │   ├── rentals.controller.js
│   │   ├── reviews.controller.js
│   │   └── messages.controller.js
│   │
│   ├── services/                   # business logic (clean controllers)
│   │   ├── auth.service.js
│   │   ├── otp.service.js
│   │   ├── items.service.js
│   │   ├── rentals.service.js
│   │   ├── payments.service.js     # optional
│   │   └── notifications.service.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Rental.js               # rental requests + approvals
│   │   ├── Review.js
│   │   ├── Message.js
│   │   └── Otp.js                  # optional
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # verify JWT
│   │   ├── role.middleware.js      # borrower/lender/admin
│   │   ├── error.middleware.js     # centralized errors
│   │   ├── validate.middleware.js  # zod/joi request validation
│   │   └── upload.middleware.js    # multer
│   │
│   ├── validators/
│   │   ├── auth.schemas.js
│   │   ├── item.schemas.js
│   │   └── rental.schemas.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── token.js
│   │   └── logger.js
│   │
│   └── docs/
│       └── swagger.js              # optional
│
├── tests/                          # optional: jest/supertest
├── uploads/                        # local uploads (or use S3/Cloudinary)
├── .env
├── package.json
└── README.md
