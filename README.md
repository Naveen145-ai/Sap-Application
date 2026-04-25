# SAP Application - Student Assessment Platform

A full-stack web application for managing student assessments, mentor evaluations, and event management with email notifications and cloud-based image storage.

## Project Overview

**SAP (Student Assessment Platform)** is a comprehensive system designed to facilitate:
- Student registration, authentication, and profile management
- SAP form submissions with file uploads to Cloudinary
- Mentor authentication and event management
- Real-time notification system
- Student marks/grades tracking and display
- Email notifications via Nodemailer

## Project Structure

- **`backend/`** - Node.js/Express REST API with MongoDB database integration
- **`frontend/`** - React.js student portal with Tailwind CSS styling
- **`mentor/`** - React.js mentor dashboard for event validation and student marking

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Cloudinary, Nodemailer

**Frontend:** React 19, React Router v7, Tailwind CSS, React Query basics

**Database:** MongoDB (Cloud)

**Storage:** Cloudinary for image uploads

## Installation & Setup

### Backend Setup
```bash
cd backend
npm install
# Configure config.env with your MongoDB, Cloudinary & email credentials
npm start  # Runs on http://localhost:8080
```

### Frontend Setup (Student Portal)
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### Mentor Portal Setup
```bash
cd mentor
npm install
npm start  # Runs on http://localhost:3001
```

## Key Features

- **Authentication:** JWT-based user & mentor authentication
- **File Upload:** Cloudinary integration for SAP form attachments
- **Email Notifications:** Nodemailer for system notifications
- **Event Management:** Mentor-driven event creation & student participation
- **Performance Tracking:** View student marks and assessment results
- **Responsive Design:** Mobile-friendly UI with Tailwind CSS

## Environment Variables

Create `config.env` in backend folder with:
```
DB_URL=your_mongodb_uri
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key
PORT=8080
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## API Routes

- **User:** `/api/users/*` - Student authentication & profile
- **Mentor:** `/api/mentor/*` - Mentor authentication & dashboard
- **SAP Forms:** `/api/sap/*` - Form submissions and management
