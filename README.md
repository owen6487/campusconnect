# Campus Connect

Campus Connect is a campus marketplace for students and nearby local businesses to buy, sell, and discover useful items, services, housing options, and campus-area offers.

**Live:** https://campusconnect.co.ke

## Screenshots

![Homepage hero](frontend/src/assets/hero/image.png)

![Campus listings](frontend/src/assets/hero/image2.png)

![Banner / brand view](frontend/public/Banner.png)

## About

Campus Connect solves the everyday challenge of campus commerce: students and local businesses around a campus often struggle to discover each other without relying on word-of-mouth alone. The platform brings student sellers, student-run businesses, and trusted local businesses into one organized marketplace that is searchable by campus, branch, category, and price.

Instead of limiting the marketplace to student-to-student resale only, Campus Connect also supports the broader campus economy, including:

- student listings
- student-run vendors
- local businesses serving campus communities
- housing and room opportunities
- services and nearby offers
- bikes and practical campus essentials

Buyers can browse listings, contact sellers directly through WhatsApp, and meet in a safe, campus-aware way. The app is designed to make local transactions easier, more transparent, and easier to discover than informal campus networking alone.

## Features

- **Sign up with email or Google** — campus and branch selected at registration
- **Post a listing in minutes** — up to 8 photos per item, stored on Cloudinary
- **Browse & search** — filter by campus, branch, category, and price range
- **Chat on WhatsApp** — contact the seller directly; no in-app payments, ever
- **Manage your listings** — edit price/description, delete anytime
- **Admin dashboard** — manage campuses, branches, users, feedback, and contact messages
- **Feedback & contact** — built-in feedback form and support contact flow
- **Shareable links** — product pages render rich previews on WhatsApp and social media

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express, JWT auth, Multer |
| Database | MongoDB Atlas (Mongoose) |
| Media | Cloudinary (uploads + on-the-fly image resizing) |
| Email | Resend (outbound) · ImprovMX (inbound forwarding to support@) |
| Auth | Google OAuth (@react-oauth/google) |


## Installation and Setup

Follow these steps when setting up the project for local development or future deployment.

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd campus_hub
```

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4) Configure environment variables

Create or update the environment files in both folders:

- `backend/.env`
- `frontend/.env`

The project currently expects variables such as:

```env
# backend/.env
PORT=5000
MONGO_URL=your string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1HR
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloud_key
CLOUDINARY_API_SECRET=your_cloud_secret
SUPPORT_EMAIL=support@campusconnect.co.ke
NO_REPLY_EMAIL=noreply@campusconnect.co.ke
RESEND_API_KEY=your_resend_key
RESEND_FROM=noreply@campusconnect.co.ke
```

```env
# frontend/.env
VITE_REACT_APP_API_URL=http://localhost:5000
VITE_SERVER_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```



### 5) Start the backend

```bash
cd backend
npm run dev
```

This starts the Express API server on the configured port.

### 6) Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

### 7) Verify the app

- Open the frontend in the browser
- Sign up or log in
- Browse listings and filter by campus/branch/category
- Post a listing with images
- Check admin and contact pages as needed

### Useful production notes

- The frontend is a Vite app and is intended for deployment on Vercel.
- The backend is an Express app and is intended for deployment on Render or a similar Node server.
- The app uses Cloudinary for uploaded listing images and Resend for outbound email notifications.
- The live production site is: https://campusconnect.co.ke

## Project Structure

```text
campus_hub/
├── backend/
│   ├── .env
│   ├── config/
│   ├── controllers/
│   ├── middlerware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   ├── server.js
│   └── seed.js
├── frontend/
│   ├── .env
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── README.md
└── .gitignore
```

