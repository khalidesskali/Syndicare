# SyndiCare — Building Management System

A full-stack web application for managing residential buildings, syndic operations, and resident services.

---

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| **Backend**  | Django 5 · Django REST Framework · SQLite     |
| **Frontend** | React 18 · TypeScript · Vite · TailwindCSS    |
| **UI**       | shadcn/ui · Radix UI · Framer Motion · Lucide |
| **Auth**     | JWT · Email-based · Role-based access control |
| **AI**       | Google Dialogflow chatbot                     |

---

## Roles & Access

- **Admin** — Manages syndics, subscription plans, and payments
- **Syndic** — Manages buildings, apartments, residents, meetings, and charges
- **Resident** — Submits complaints, tracks requests, views charges and meeting info

---

## Key Features

- Multi-role authentication (Admin / Syndic / Resident)
- Building & apartment management
- Complaint / reclamation tracking system
- Meeting scheduling and management
- Monthly charge creation and payment tracking
- Subscription plan management with payment proof uploads
- AI-powered chatbot (Dialogflow) for resident support
- Responsive UI with animated components

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Backend runs on `http://localhost:8000` · Frontend runs on `http://localhost:5173`

---

## Project Structure

```
Syndic app/
├── backend/
│   ├── myapp/          # Models, views, serializers, API endpoints
│   ├── mysite/         # Django settings & configuration
│   ├── chatbot/        # Dialogflow integration & webhook handlers
│   └── manage.py
├── frontend/
│   └── src/
│       ├── api/        # Axios API services
│       ├── components/ # Reusable UI components
│       ├── pages/      # Role-based page views
│       ├── hooks/      # Custom React hooks
│       ├── types/      # TypeScript types
│       └── routes/     # App routing
└── requirements.txt
```

---

## Status

> 🚧 **Active development** — Core features are functional. Ongoing work on UI polish, reporting, and performance.

**Version**: 0.2.0-dev &nbsp;|&nbsp; **Last Updated**: March 2026
