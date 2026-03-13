# BorrowAtoZ

BorrowAtoZ is a full-stack rental marketplace for both physical items and on-demand services. Users can create listings, browse by city and category, send rental requests, approve or reject bookings, message each other around a listing, complete rentals, and leave post-rental reviews.

The project is built as a production-style learning system with real marketplace constraints: role-aware actions, billing-rule validation, booking lifecycle management, image uploads, review integrity, and authenticated socket connections.

## Tech Stack

### Frontend
- Next.js 16
- React 19
- Redux Toolkit + RTK Query
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO

### Supporting Services
- Cloudinary for listing images
- Nodemailer for OTP email delivery
- JWT stored in HTTP-only cookies for auth

## Current Features

### Authentication
- User registration with email OTP verification
- Login/logout flow
- Protected backend routes using JWT cookie auth
- Profile endpoint for authenticated users

### Listings
- Create item or service listings
- Enforce listing-specific billing rules
- Upload up to 10 images per listing
- Update listing details and manage listing photos
- Browse listings with:
  - city filter
  - type filter
  - category filter
  - price range
  - text search
  - sorting
  - pagination
- View individual listing detail pages

### Rental Requests and Rentals
- Create rental requests from listing pages
- Prevent duplicate requests for the same borrower/date range
- Block users from requesting their own listing
- Validate booking dates
- Support multiple billing models:
  - `HOUR`
  - `DAY`
  - `PER_GUEST`
  - `PER_GROUP`
- Approve, reject, or cancel rental requests
- Convert approved requests into rentals
- Compute total amount from billing rules and booking duration
- Track rental lifecycle:
  - `ACTIVE`
  - `COMPLETED`
  - `CANCELLED`
  - `DISPUTED`

### Messaging
- Create or reuse a conversation from a listing
- Restrict conversations to listing participants
- Fetch paginated conversation messages
- Send messages inside a conversation
- Mark conversation messages as read
- Socket-authenticated conversation room joining

### Reviews and Ratings
- Borrowers can review completed rentals as listing reviews
- Lenders can rate borrowers after completed rentals
- Duplicate review prevention using unique indexes
- Listing rating cache via `avgRating` and `ratingCount`
- Provider and borrower rating summary endpoints

## Domain Model

Core entities in the system:

- `User`
- `Category`
- `Listing`
- `RentalRequest`
- `Rental`
- `Conversation`
- `Message`
- `Review`

The data model is designed around marketplace flows rather than generic CRUD. For example:

- `Listing` supports `ITEM` and `SERVICE` with different billing constraints.
- `RentalRequest` captures intent before a booking becomes a rental.
- `Rental` snapshots booking data such as `priceAtBooking` and `billingUnit`.
- `Review` is tied to a real completed rental to reduce fake reviews.

## Architecture Notes

- Frontend and backend are split into `client/` and `server/`.
- The frontend uses RTK Query for API calls and cache invalidation after mutations.
- Express routes are organized by domain: users, listings, rental requests, rentals, conversations.
- Socket.IO shares the same JWT cookie auth model as REST endpoints.
- Mongoose schema validation is used to enforce business rules close to the data layer.

## Project Structure

```text
borrowatoz/
├── client/   # Next.js app
├── server/   # Express API + MongoDB models + sockets
├── ideas.md
├── todo.md
└── README.md
```

## Key User Flows

### Borrower Flow
1. Register and verify email with OTP
2. Browse tools or services
3. Open a listing
4. Send a rental request
5. Message the owner if needed
6. Track request/rental status
7. Leave a review after completion

### Lender Flow
1. Create and manage listings
2. Receive incoming rental requests
3. Approve or reject requests
4. Manage active rentals
5. Mark rentals completed
6. Rate borrowers after successful rentals

## API Overview

Main route groups:

- `/api/v1/user`
- `/api/v1/listings`
- `/api/v1/categories`
- `/api/v1/rental-requests`
- `/api/v1/rentals`
- `/api/v1/conversations`

Examples of implemented endpoints:

- `POST /api/v1/user/register`
- `POST /api/v1/user/login`
- `POST /api/v1/user/verify-otp`
- `GET /api/v1/listings`
- `GET /api/v1/listings/:id`
- `POST /api/v1/rental-requests/listings/:id`
- `PATCH /api/v1/rental-requests/:id/approve`
- `GET /api/v1/rentals/me`
- `POST /api/v1/conversations/from-listing/:listingId`
- `POST /api/v1/conversations/:id/messages`

## Local Development

### Prerequisites
- Node.js
- npm
- MongoDB connection string
- Cloudinary account
- SMTP credentials for email OTP

### Install

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### Run the backend

```bash
cd server
npm run dev
```

### Run the frontend

```bash
cd client
npm run dev
```

## Environment Variables

### Server

Create `server/.env` with values similar to:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OTP_SECRET=your_otp_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_HOST=your_smtp_host
MAIL_PORT=your_smtp_port
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password
MAIL_FROM=your_from_email
```

### Client

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Seeds

The backend contains seed files for listings and categories under `server/src/seeds/`. These are useful for local testing and expanding browse scenarios.

## Current Limitations

- Payment flow exists only as an early model and is not integrated yet
- Socket setup currently handles authenticated room connections, but live UI messaging is still evolving
- Client route middleware is present but not implemented
- Some admin-focused flows are planned rather than complete
- Automated tests are not added yet

## Roadmap

Future goals gathered from the project notes:

- Add refresh token + access token flow
- Add OTP resend cooldown and attempt limits
- Prevent creating a user record before OTP is successfully sent
- Finish and polish the messaging UI
- Add infinite scroll in chat
- Expand service billing models further
- Add pause/unpause listing workflow
- Improve logout handling
- Add admin middleware coverage where needed
- Add caching
- Detect browser/IP location and show nearby listings
- Support more precise address handling while searching by city
- Explore video upload support for listings
- Improve profile privacy and avoid exposing user buying history
- Add stronger controller testing

## Why This Project Matters

BorrowAtoZ is not just a listing app. It explores the harder parts of marketplace systems:

- multi-role workflows
- domain-driven validation
- request-to-rental state transitions
- review integrity tied to completed transactions
- real-time communication patterns
- frontend and backend coordination across authenticated flows

## Author

Prashant Khadka Magar
