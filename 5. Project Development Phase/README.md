# AI-Powered Debt Relief & Financial Recovery Platform

An intelligent AI-powered financial recovery platform designed to help borrowers manage debt loads, analyze overall financial health, receive AI-generated settlement recommendations, generate professional negotiation strategy letters for lenders, and track their financial recovery progress.

---

## 🚀 Key Features

* **Authentication & Profiles**: Secure sign-up and sign-in using JWT authentication with custom PBKDF2 secure password hashing.
* **Liability Ledger**: Full CRUD loan management supporting status categorizations (Active, Overdue, Settled, Closed).
* **Interactive Dashboard**: Aggregate liability metrics, Debt Stress Scores, savings suggestions, and visual graphs (Debt Distribution, EMI comparisons, Allocation area flow, Recovery lines).
* **AI Recommendation Engine**: Invokes Gemini to evaluate cash flows and output target settlement percentages, probability scores, risk ratings, and prioritizations.
* **AI Negotiation strategizer**: Drafts empathetic, professional hardship emails and letters for lenders (Chase, Discover, etc.) with strategic bullet talking points.
* **AI Financial Advisor Chat**: Direct conversational assistant to discuss consolidated payoffs, snowball vs. avalanche strategies, and collectors strategies.
* **Reports Exporter**: Dynamic streaming generation of professional PDF dossiers (via `reportlab`) and structured multi-sheet Excel files (via `openpyxl`).

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Recharts, Framer Motion, React Hook Form, Lucide Icons.
* **Backend**: FastAPI, Python 3.12, SQLAlchemy ORM, SQLite Database, PyJWT, python-multipart.
* **AI**: Google Gemini API.
* **Deployment**: Docker, Docker Compose.

---

## 📁 Workspace Folder Structure

```
smart bridge applicatios/
├── backend/
│   ├── app/
│   │   ├── auth/              # JWT token and PBKDF2 hashing helpers
│   │   ├── database/          # SQLite database session dependency
│   │   ├── models/            # SQLAlchemy database tables
│   │   ├── routers/           # FastAPI REST endpoints
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Gemini AI connection and PDF/Excel generation
│   │   └── main.py            # FastAPI entry point
│   ├── Dockerfile
│   ├── requirements.txt       # Backend dependencies
│   ├── seed.py                # Database seeding script
│   └── .env                   # Local configuration
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, ProtectedRoute
│   │   ├── pages/             # Landing, Dashboard, Loans, Chat, Recommendations, etc.
│   │   ├── services/          # Authenticated Axios API client
│   │   ├── App.jsx            # Routing configurations
│   │   └── index.css          # Tailwind styling and glassmorphism resets
│   ├── Dockerfile
│   ├── nginx.conf             # Production routing configuration for SPA
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind CSS theme setup
├── docker-compose.yml         # Container configuration
└── README.md                  # Setup instructions
```

---

## 💻 Local Developer Installation

### Prerequisites
* **Python 3.12+**
* **Node.js LTS (v20+)**

### 1. Setup the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env` (add your `GEMINI_API_KEY`):
   ```env
   DATABASE_URL=sqlite:///./debt_relief.db
   SECRET_KEY=9a1b8c7d6e5f4c3b2a1a0f9e8d7c6b5a
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Seed the SQLite database with testing data:
   ```bash
   python seed.py
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * The API documentation will be available at `http://127.0.0.1:8000/docs`

---

### 2. Setup the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.

---

## 🐳 Running via Docker

You can build and deploy the complete stack inside containers in one command:

1. Ensure Docker is running.
2. In the root project directory, run:
   ```bash
   docker-compose up --build
   ```
3. The frontend is accessible at `http://localhost:5173` and the backend at `http://localhost:8000`.

---

## 🔒 Mock Credentials for Testing

To login and test the populated dashboard straight out-of-the-box:
* **Username / Email**: `test@example.com`
* **Password**: `password123`
