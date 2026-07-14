# Phase 7: Project Documentation

## 🔌 1. API Endpoints Specification

### Authentication & Profile
* `POST /auth/register` - Create a new user profile.
* `POST /auth/token` - Authenticate user credentials and retrieve a JWT Token.
* `GET /auth/profile` - Fetch current logged-in borrower details.
* `PUT /auth/profile` - Edit full name, phone number, income, and occupation fields.

### Loan Management
* `GET /loans` - List all liabilities (optional query param `status_filter`).
* `POST /loans` - Add a new outstanding loan account.
* `PUT /loans/{id}` - Update details or balance of an existing loan.
* `DELETE /loans/{id}` - Remove a loan account.

### Health Analysis & Audits
* `POST /analyze` - Calculate and log DTI ratios, surplus funds, and stress indices.
* `GET /analyze/history` - Retrieve history list of past analysis audits.
* `GET /dashboard` - Get aggregated dashboard statistics (totals, averages, monthly cash commitments).

### AI Services (Gemini)
* `POST /recommend` - Request AI settlement target forecasts and strategic guidance.
* `GET /recommend` - List historical recommendations log.
* `POST /negotiation/generate-letter` - Generate structured lender hardship letter templates.
* `GET /negotiation` - List historically drafted letter metadata.
* `PUT /negotiation/{id}/status` - Modify status (Draft, Sent, Accepted, Rejected) in the ledger.
* `POST /chat` - Interact with the AI financial advisor assistant.
* `DELETE /chat/clear` - Reset chat history log.

### File Exports
* `GET /reports/pdf` - Stream compiled PDF report.
* `GET /reports/excel` - Stream compiled Excel spreadsheet workbook.

---

## 💻 2. Local Setup Guide

1. **Activate Python Virtual Environment**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
2. **Install requirements**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Database Seeding**:
   ```bash
   python seed.py
   ```
4. **Launch Backend API**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. **Launch Frontend React Dev Server**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   * Open [http://localhost:5173](http://localhost:5173) in your browser.
