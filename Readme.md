# Syndic App - Building Management System

A comprehensive web application for managing residential buildings and syndic operations. This application provides a complete solution for building administrators, syndics, and residents to manage their properties efficiently.

## 🏢 Project Overview

Syndic App is a full-stack web application designed to streamline building management operations. It features role-based access control with three main user types:

- **Admin**: System administrators who manage syndics and subscription plans
- **Syndic**: Building managers who handle buildings, residents, and operations
- **Resident**: Building occupants who can submit requests and view their information

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 5.2.8
- **Database**: SQLite (development)
- **Authentication**: Custom user model with email-based authentication
- **API**: Django REST Framework
- **Language**: Python

### Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI with shadcn/ui
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Animations**: Framer Motion

### AI & Chatbot

- **NLP Service**: Google DialogFlow
- **Chatbot Integration**: Custom chatbot widget with real-time responses
- **Intent Handling**: Dynamic intent routing for user queries
- **Authentication**: User-aware chatbot with personalized responses

## 🚀 Features

### Core Functionality

- **User Management**: Multi-role authentication system
- **Building Management**: Create and manage buildings and apartments
- **Resident Management**: Syndics can add and manage residents
- **Complaint System**: Residents can submit and track complaints/reclamations
- **Meeting Management**: Organize and manage building meetings
- **Financial Management**: Handle charges and payments
- **Subscription System**: Manage syndic subscriptions and payment proofs
- **AI Chatbot**: DialogFlow-powered assistant for user queries and support

### Role-Based Features

#### Admin

- Create and manage syndic accounts
- Manage subscription plans
- Handle payment records
- System-wide oversight

#### Syndic

- Manage buildings and apartments
- Add and manage residents
- Handle resident complaints
- Organize meetings
- Create monthly charges
- Track payments

#### Resident

- View personal information
- Submit complaints/requests
- Track complaint status
- View charges and payments
- Access meeting information

## 📁 Project Structure

```
Syndic app/
├── backend/                 # Django backend application
│   ├── myapp/              # Main Django app
│   │   ├── models.py       # Database models
│   │   ├── views/          # API views
│   │   ├── serializers.py  # Data serializers
│   │   └── urls.py         # API endpoints
│   ├── mysite/             # Django project settings
│   ├── chatbot/            # DialogFlow chatbot integration
│   │   ├── services/       # Chatbot services and handlers
│   │   ├── views.py        # Chatbot API endpoints
│   │   └── credentials/    # DialogFlow service account
│   ├── manage.py           # Django management script
│   └── db.sqlite3          # SQLite database
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── chatbot/    # Chatbot UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   │   └── chatbotApi.ts # Chatbot API service
│   │   ├── types/          # TypeScript type definitions
│   │   └── routes/         # Route configurations
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🗄️ Database Models

### User Management

- **User**: Custom user model with roles (Admin, Syndic, Resident)
- **SyndicProfile**: Extended profile for syndic users
- **ResidentProfile**: Extended profile for resident users

### Building Management

- **Immeuble**: Building information
- **Appartement**: Apartment details within buildings

### Operations

- **Reclamation**: Complaint/request system
- **Reunion**: Meeting management
- **Charge**: Monthly charges for apartments
- **ResidentPayment**: Payment tracking

### Financial

- **SubscriptionPlan**: Available subscription plans
- **Subscription**: Active subscriptions for syndics
- **Payment**: Payment records for subscriptions

## 🚦 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Backend Configuration

- Database settings in `backend/mysite/settings.py`
- Environment variables in `backend/.env`
- CORS settings for frontend-backend communication

### Frontend Configuration

- API endpoints in `frontend/src/api/`
- Route configurations in `frontend/src/routes/`
- Environment variables for API base URL

## 📝 API Endpoints

The application provides RESTful API endpoints for:

- Authentication and authorization
- User management
- Building and apartment management
- Complaint handling
- Meeting management
- Financial operations
- Subscription management
- Chatbot integration (`/chat/` and `/dialogflow/webhook/`)

## 🤖 Chatbot Features

### DialogFlow Integration

- **Natural Language Processing**: Google DialogFlow for intent recognition
- **User Authentication**: Session-based user identification
- **Dynamic Intent Handling**: Custom handlers for specific user queries
- **Real-time Responses**: Instant chatbot replies via webhook integration

### Chatbot Capabilities

- **Charge Information**: Users can ask about charges, payments, and billing
- **Complaint Guidance**: Help with submitting and tracking complaints
- **General Support**: Answer common questions about building management
- **Personalized Responses**: User-aware responses based on account data

### Frontend Chatbot Widget

- **Interactive Interface**: Modern chat widget with message history
- **Quick Questions**: Pre-defined questions for common queries
- **Real-time Typing Indicators**: Enhanced user experience
- **Responsive Design**: Works across all device sizes

## 🔐 Authentication

- Email-based authentication system
- JWT tokens for API authentication
- Role-based access control
- Protected routes based on user roles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🚧 Status

**⚠️ This project is currently under development**

Features and functionality are being actively developed and improved. Some features may be incomplete or subject to change.

### Current Development Focus

- Enhanced user interface and user experience
- Additional reporting and analytics features
- Mobile responsiveness improvements
- Performance optimizations
- Security enhancements

### Upcoming Features

- Real-time notifications
- Document management system
- Advanced reporting dashboard
- Integration with payment gateways

**Last Updated**: January 2026
**Version**: 0.1.0 (Development)
