import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.database import engine, Base
from backend.app.routers import auth, loans, dashboard, analysis, recommendations, negotiation, chat, reports

# Automatically create SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ANTI DEBT API",
    description="Backend services for analyzing borrower financial health, generating settlement letters, recommendations and chat advising.",
    version="1.0.0"
)

# Enable CORS for frontend local development and production
origins = [
    "http://localhost:5173",   # Vite default dev server
    "http://localhost:3000",   # Alternative local port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"                        # Wildcard fallback for container testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router endpoints
app.include_router(auth.router)
app.include_router(loans.router)
app.include_router(dashboard.router)
app.include_router(analysis.router)
app.include_router(recommendations.router)
app.include_router(negotiation.router)
app.include_router(chat.router)
app.include_router(reports.router)

@app.get("/")
def get_root():
    return {
        "status": "online",
        "api_documentation": "/docs",
        "platform": "AI Powered Debt Relief & Financial Recovery Platform"
    }
