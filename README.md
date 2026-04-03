# DrP Front — Driven Projects

Frontend of **Driven Projects**, a personal project management application and headless CMS for an external portfolio.

Built with **Next.js 16 / React 19 / TypeScript / TailwindCSS 4**, based on the [TailAdmin Free](https://tailadmin.com) template.

---

## Credits

This project is built on top of **TailAdmin Free** (Next.js version), a free and open-source admin dashboard template by [Pimjo](https://pimjo.com).

- 🐙 GitHub: [https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template](https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template)
- 📄 License: MIT

The UI components, base layout structure, sidebar behavior, form elements, and typography system all come from TailAdmin Free. This project adapts and extends them for the specific needs of DrP — no components were reinvented from scratch.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Key Features](#key-features)

---

## Overview

DrP Front is the private dashboard interface for the Driven Projects application. It connects to [drp-api](https://github.com/your-username/drp-api) and provides:

- A **dashboard** with real-time project and task statistics
- A **projects list** with filtering, pagination, and CRUD operations
- A **project detail page** with full task and subtask management, and portfolio publishing controls
- A **Cloudinary image upload** system for project visuals and carousel images

It is a **single-user application** — designed exclusively for its creator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS 4 |
| UI Base | TailAdmin Free (MIT) |
| Server state | TanStack Query (React Query) |
| Global state | Zustand |
| HTTP client | Axios |
| Font | Outfit (Google Fonts) |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/drp-front.git
cd drp-front

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API URL

# Start development server
npm run dev
```

App runs on `http://localhost:3000` by default.

Make sure the [DrP API](https://github.com/your-username/drp-api) is running locally on port `5000` before starting the frontend.

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

In production, replace with your Render API URL:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (fonts, providers)
│   ├── (admin)/
│   │   ├── layout.tsx                 # Dashboard layout (Sidebar + Header)
│   │   ├── page.tsx                   # Dashboard
│   │   └── projects/
│   │       ├── page.tsx               # Projects list
│   │       └── [id]/page.tsx          # Project detail
│   └── (full-width-pages)/
│       └── (auth)/
│           └── signin/page.tsx        # Sign in
│
├── components/
│   ├── auth/SignInForm.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── StatsCard.tsx
│   │   └── RecentProjectsTable.tsx
│   ├── projects/
│   │   ├── ProjectsPage.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectFormModal.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   └── TaskItem.tsx
│   └── layout/
│       ├── AppSidebar.tsx
│       └── AppHeader.tsx
│
├── hooks/
│   ├── useProjects.ts
│   ├── useTasks.ts
│   ├── useStats.ts
│   └── useUpload.ts
│
├── store/
│   └── auth.store.ts                  # Zustand store (JWT + user session)
│
├── lib/
│   └── api.ts                         # Axios instance with JWT interceptor
│
├── types/
│   └── index.ts                       # Shared TypeScript types
│
└── middleware.ts                      # Route protection (cookie-based)
```

---

## Authentication

Authentication is handled via JWT:

1. User submits credentials → `POST /api/auth/login`
2. Token is stored in both `localStorage` (for Axios interceptor) and a cookie `drp_token` (for Next.js middleware route protection)
3. All private routes are protected by `src/middleware.ts` — unauthenticated users are redirected to `/signin`
4. On 401 response, Axios automatically clears the token and redirects to `/signin`

---

## Key Features

### Dashboard
Real-time stats fetched from `GET /api/stats`: total projects, breakdown by status, total tasks, breakdown by task status, and a table of the 5 most recently updated projects.

### Projects list
Grid of project cards with status/priority filters and pagination (9 per page). Each card links to the project detail page. Full CRUD and publish toggle available inline.

### Project detail
The most complete page of the app:
- Project header with status, priority, and publish state
- Information section: description, context, estimated hours, tech stack pills, GitHub and demo links
- Task management: create, edit (inline), delete, status cycle (TODO → IN_PROGRESS → DONE), accordion to reveal subtasks
- Subtask management: inline create, checkbox toggle, delete on hover
- Portfolio section: publish/unpublish button with validation, carousel image upload and management

### Image upload
Images are uploaded directly to Cloudinary via `POST /api/upload`. The main project image is stored in `imageUrl`. Additional carousel images are stored as a comma-separated string in `images` and managed from the project detail page.

### Dark mode
Toggled via a button in the header and sidebar footer. Persisted in `localStorage`. The `dark` class is applied on the `<html>` element.