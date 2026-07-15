# EduHub — College Resource Platform

> **IMPORTANT — Gemini API Key Migration**
>
> Google AI Studio has deprecated legacy `AIza...` Traffic Keys in favor of new `AQ...` Authentication Keys. Older models (`gemini-2.0-flash`, `gemini-2.5-flash`) return a **404 "model no longer available"** error when called with a new `AQ` key.
>
> **Fix:** Use `gemini-3.5-flash` (or any `gemini-3.x` model) and set your new `AQ...` key as `GEMINI_API_KEY` in `server/.env`.

A full-stack web application built for engineering students to access question papers, placement records, a peer community, and AI-powered learning path recommendations — all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Features

### Student Portal
- **Dashboard** — Stats overview, recent activity, and quick access to all features
- **Question Papers** — Browse, filter, and download past exam papers (by year, semester, branch, exam type)
- **Placement Records** — View company-wise placement data, CTCs, required skills, interview questions, and student selections
- **Community** — Create posts (discussions, questions, achievements, resources, projects), like, comment, and get notified
- **AI Recommendations** — Personalized learning path suggestions powered by Google Gemini / Groq with rule-based fallback
- **Profile** — Avatar, cover photo, skills with proficiency levels, career goals, interests, and social links

### Admin Panel
- **Dashboard** — Platform-wide statistics
- **Upload Papers** — Upload question papers directly to Cloudinary
- **Manage Placements** — Full CRUD on placement records with interview Q&A
- **Manage Users** — View and manage all registered student accounts

### General
- JWT authentication with role-based access (student / admin)
- Password reset via email token
- Real-time notifications via Socket.io
- Dark / light mode support
- Fully responsive — mobile-first design

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| React Router DOM 7 | Client-side routing |
| Tailwind CSS 4 | Styling |
| Axios | HTTP client |
| TanStack React Query | Server state management |
| Socket.io Client | Real-time communication |
| Lucide React | Icons |
| React Hot Toast | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database and ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Cloudinary + Multer | File upload and cloud storage |
| Socket.io | Real-time events |
| Google Generative AI (Gemini) | AI recommendations |
| Groq SDK | Fallback LLM provider |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Managed cloud database |
| Cloudinary | PDF and image storage |
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## Project Structure

```
college-resource-platform/
├── client/                         # React frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   └── community/          # Community-specific components
│   │   ├── context/                # React Context (Auth, Theme, Admin Auth)
│   │   ├── layout/                 # DashboardLayout, AdminLayout
│   │   ├── pages/                  # Full page components
│   │   ├── routes/                 # Route definitions and guards
│   │   ├── services/               # Axios API service layer
│   │   └── utils/                  # Helper utilities
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                         # Node.js backend
    ├── config/                     # DB and Cloudinary config
    ├── controllers/                # Route handlers / business logic
    ├── middleware/                  # Auth, admin middleware
    ├── models/                     # Mongoose schemas
    ├── routes/                     # Express route definitions
    ├── services/                   # AI recommendation engine
    ├── data/                       # Static data files
    ├── server.js                   # Entry point
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google Gemini API key (for AI recommendations)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/college-resource-platform.git
cd college-resource-platform
```

### 2. Setup the backend

```bash
cd server
npm install
```

Create a `.env` file in the `/server` directory (see [Environment Variables](#environment-variables)).

```bash
npm run dev       # Development with nodemon
# or
npm start         # Production
```

Server runs on `http://localhost:5000`

### 3. Setup the frontend

```bash
cd client
npm install
```

Create a `.env` file in the `/client` directory (see [Environment Variables](#environment-variables)).

```bash
npm run dev       # Development server
npm run build     # Production build
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

### Server (`/server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/college-platform
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### Client (`/client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

> **Note for deployment:** Set `VITE_API_URL` to your Render backend URL with `/api` suffix, e.g. `https://your-app.onrender.com/api`

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Student registration |
| POST | `/login` | Student login |
| POST | `/logout` | Student logout |
| POST | `/admin-login` | Admin login |
| POST | `/admin-logout` | Admin logout |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Complete password reset |

### Profile — `/api/profile`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get current user profile |
| PUT | `/` | Update profile details |
| POST | `/avatar` | Upload avatar image |
| POST | `/cover` | Upload cover photo |

### Question Papers — `/api/questionpapers`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Student | Get all papers |
| GET | `/filter` | Student | Filter papers by criteria |
| POST | `/add` | Admin | Upload new paper |
| PUT | `/update/:id` | Admin | Update paper metadata |
| DELETE | `/delete/:id` | Admin | Delete paper |

### Placements — `/api/placements`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Student | Get all placements |
| GET | `/:id` | Student | Get placement detail |
| POST | `/` | Admin | Create placement record |
| PUT | `/:id` | Admin | Update placement |
| DELETE | `/:id` | Admin | Delete placement |

### Community Posts — `/api/posts`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all posts |
| POST | `/` | Create a post |
| POST | `/upload` | Upload post images |
| GET | `/:id` | Get single post |
| PUT | `/:id` | Update post |
| DELETE | `/:id` | Delete post |
| POST | `/:id/like` | Toggle like |

### Comments — `/api/comments`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/:postId/comments` | Add comment to post |
| PUT | `/:id` | Update comment |
| DELETE | `/:id` | Delete comment |
| POST | `/:id/like` | Toggle like on comment |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get user notifications |
| GET | `/count` | Get unread count |
| DELETE | `/` | Clear all notifications |
| DELETE | `/:id` | Delete single notification |

### Recommendations — `/api/recommendations`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get AI recommendations (cached or fresh) |
| POST | `/refresh` | Force refresh recommendations |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Platform-wide statistics |
| GET | `/users` | All users with pagination |
| GET | `/users/:userId` | Single user detail |

---

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set root directory to `client/`
3. Build command: `npm run build`
4. Output directory: `dist/`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SERVER_URL=https://your-backend.onrender.com
   ```

A `vercel.json` is already present in `/client` configured for SPA routing rewrites.

### Backend (Render)

1. Connect your GitHub repo to Render
2. Root directory: `server/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all server environment variables listed above

> **Cold start:** Render free tier spins down after 15 minutes of inactivity. The first request may take 1-2 minutes to respond. Use [cron-job.org](https://cron-job.org) to ping your API URL every 10 minutes to keep the server warm.

---

## License

MIT
