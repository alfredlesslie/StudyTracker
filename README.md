StudySense AI

StudySense AI is an AI-assisted study planning and academic tracking
platform designed to help students organize their syllabus, monitor
study progress, prepare for exams, and explore data-informed exam score
predictions.

Live Demo

Frontend: https://study-tracker-jrs9.vercel.app/

Backend API: https://studysense-backend.onrender.com

Interactive API documentation:
https://studysense-backend.onrender.com/docs

Health check: https://studysense-backend.onrender.com/health

The live demo depends on the availability and configuration of the
hosted frontend, backend, database, and Gemini API.

Features

Syllabus and subject tracking --- organize subjects, modules,
and topics.

Study progress tracking --- record and review learning progress.

Study sessions and plans --- organize study activity and
preparation.

Quizzes and exams --- support exam preparation and tracking.

AI Tutor --- ask study-related questions using the
Gemini-powered backend.

Exam score prediction --- use a Linear Regression model to
estimate exam scores from available features and study data.

Prediction insights --- the backend exposes model evaluation
metrics and prediction-related endpoints.

Predictions are estimates, not guarantees. Their reliability depends on
the training data, input quality, and whether a student's circumstances
are represented by the model.

Technology Stack

Frontend

React

Vite

JavaScript

Lucide React

Canvas Confetti

Backend

Python

FastAPI

SQLAlchemy

Pydantic

Gemini API (google-genai)

Machine Learning

Python

scikit-learn

pandas

NumPy

Linear Regression

Deployment

Vercel --- frontend

Render --- backend

Architecture

Student's browser
       |
       v
React + Vite frontend (Vercel)
       |
       | HTTPS API requests
       v
FastAPI backend (Render)
       |                 |
       v                 v
Database           Gemini API
       |
       v
ML prediction code (Linear Regression)

The main backend imports the ML prediction function directly. The
repository also contains a separate ML API entry point; whether it is
deployed separately depends on the deployment configuration.

Repository Structure

StudyTracker/
├── src/                    # React frontend source
├── public/                 # Static frontend assets (if present)
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application and CORS configuration
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Backend services
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Request/response schemas
│   │   └── ...
│   ├── requirements.txt    # Backend Python dependencies
│   └── ...
├── ml/
│   ├── api.py              # Separate ML API entry point
│   └── src/                # ML prediction code
├── package.json
├── package-lock.json
└── README.md

Some folders or files may vary by branch or project version.

Run Locally

Requirements

Node.js and npm

Python 3.12 recommended for compatibility

A Gemini API key for AI Tutor functionality

1. Clone the repository

git clone https://github.com/alfredlesslie/StudyTracker.git
cd StudyTracker

2. Start the frontend

From the repository root:

npm install

Configure the frontend backend URL in your local environment as
supported by your setup:

VITE_API_BASE_URL=http://127.0.0.1:8000

Start the development server:

npm run dev

Vite normally serves the app at http://localhost:5173.

3. Configure and start the backend

Install backend dependencies:

pip install -r backend/requirements.txt

Configure the backend environment variables (see below), then start
FastAPI from the repository root:

uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

The API documentation should be available at
http://127.0.0.1:8000/docs.

The backend imports code from both backend/ and ml/, so run it
from the repository root rather than from inside backend/.

Environment Variables

Never commit real credentials or API keys. Keep secrets in local
environment files ignored by Git and in the hosting provider's
environment-variable settings.

Variable                Purpose                 Example / Notes

VITE_API_BASE_URL     Base URL used by the    http://127.0.0.1:8000 locally; deployed
frontend for backend    backend URL in production
requests

GEMINI_API_KEY        Server-side Gemini API  Set privately in the backend host
key used by the AI
Tutor

GEMINI_MODEL          Gemini model name       The application configuration currently
defaults to gemini-3.5-flash-lite

DATABASE_URL          Optional database       If omitted, the backend configuration defaults
connection URL          to a local SQLite database

Use .env.example as a template if provided. Do not put
GEMINI_API_KEY in a VITE_ variable: Vite variables are exposed to
browser-side code.

API Endpoints

The FastAPI interactive documentation is the most reliable source for
the currently registered endpoints:

GET /health --- backend and model health information.

GET /api/predictions --- retrieve stored prediction history.

GET /api/predictions/subject/{subject_id} --- retrieve or generate
a subject prediction.

GET /api/predictions/exam/{exam_id} --- get an exam-scope
prediction and related statistics.

POST /predict --- make a direct feature-based ML prediction.

POST /api/tutor/chat --- send a conversational message to the AI
Tutor.

See /docs on the deployed backend for request schemas and additional
endpoints.

Model Evaluation

The deployed health endpoint has reported these evaluation values for
the Linear Regression model:

Metric                         Reported value

Test MAE                                4.581
Test RMSE                               8.334
Test R²                                0.8203
Cross-validation mean MAE               4.668
Cross-validation mean RMSE              7.538
Cross-validation mean R²               0.8395
Baseline MAE                           14.694
Baseline RMSE                           19.74
Baseline R²                           -0.0082

These values are reported by the deployed application and may change
when the model, dataset, or evaluation process changes. They are not a
promise of the error for an individual student's prediction. Include the
dataset and validation method in project documentation when presenting
these metrics academically.

Security and Operational Notes

Keep Gemini credentials on the backend only.

Restrict CORS to the frontend origins you actually use.

Add server-side rate limiting and suitable abuse protections before
sharing the AI Tutor widely.

Monitor Gemini API usage and quotas.

Configure persistent database storage for production data. A local
SQLite file on a hosted service may not be durable across
redeployments or instance changes unless persistent storage is
configured.

Do not rely on CORS as an authentication or rate-limiting mechanism.

Avoid putting private student information or credentials in public
repositories, logs, or issue reports.

Contributing

Create a branch for your change.

Make and test your changes locally.

Ensure the frontend builds:

npm run build

Submit a pull request or push the changes to your working
repository.

Disclaimer

StudySense AI is an educational support project. AI-generated
explanations and predicted scores may be inaccurate. Students should use
predictions as guidance rather than as guaranteed outcomes.

License

No license is specified in this README. Add a LICENSE file and update
this section if you decide to publish the project under a particular
open-source license.
