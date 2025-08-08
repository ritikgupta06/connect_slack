Slack Connect App

A full-stack Slack Connect application with OAuth 2.0 authentication, secure token storage, immediate and scheduled message sending, and scheduled message management.

Project Structure

-   frontend → Vite + React application (UI)

-   backend → Node.js + TypeScript API server

-   screens → Screenshots of the app

Frontend Setup

1.  cd frontend

2.  npm install

3.  npm run dev\
    Runs the development server at <http://localhost:5173>

Backend Setup

1.  cd backend

2.  npm install

3.  npm run dev\
    Runs the backend API server at <http://localhost:3000>

Make sure to create a `.env` file inside the backend directory.\
You can use the provided env.example as a reference:\
cp backend/env.example backend/.env

Screenshots\
The screens/ folder contains images showing how the app looks and works.\
Example: login screen, dashboard, schedule message view.

Environment Variables\
Refer to backend/env.example for the required environment variables.

Features

-   Slack OAuth 2.0 authentication

-   Secure token storage & refresh logic

-   Send messages instantly or schedule them

-   Manage (view/cancel) scheduled messages

-   Full-stack deployment ready
