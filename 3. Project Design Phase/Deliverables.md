# Phase 3: Project Design Phase

## 🎯 1. Problem-Solution Fit

| Problem faced by Borrower | Solution provided by ANTI DEBT |
| :--- | :--- |
| Fear of aggressive collectors | **AI Negotiation Generator** drafting legally sound, structured hardship letters. |
| Delinquent loan default risks | **AI Recommendations** calculating realistic settlement target values and acceptance rates. |
| Inability to budget pay-offs | **Calculations Engine** computing DTI, Remaining Surplus, and overall Stress Indexes. |
| Unclear long-term relief path | **AI Financial Advisor Chat** providing educational insights (Snowball vs. Avalanche). |

---

## 🏗️ 2. Solution Architecture

The application is structured as a decoupled, multi-layered architecture:

```mermaid
graph TD
    subgraph Client Tier (React / Vite)
        UI[Glassmorphic Views] --> Router[React Router]
        Router --> API[Axios Auth Client]
    end
    
    subgraph Application Tier (FastAPI)
        API --> Controllers[REST Routers]
        Controllers --> AuthServ[Custom PBKDF2 Auth Service]
        Controllers --> GeminiServ[Gemini Wrapper Service]
        Controllers --> FileServ[ReportLab & OpenPyXL Service]
    end

    subgraph Data Tier (SQLite)
        AuthServ --> DB[(SQLite DB)]
        Controllers --> DB
    end
    
    GeminiServ --> GeminiAPI((Google Gemini API))
```

---

## 💾 3. Database Schema Design (SQLite)

The database schema utilizes relationships and primary keys as detailed below:

```mermaid
erDiagram
    USERS ||--o{ LOANS : "tracks"
    USERS ||--o{ RECOMMENDATIONS : "receives"
    USERS ||--o{ LETTERS : "drafts"
    USERS ||--o{ ANALYSIS : "audits"
    USERS ||--o{ CHAT_HISTORY : "converses"
    
    USERS {
        int id PK
        string email UNIQUE
        string password_hash
        string full_name
        string phone
        float monthly_income
        string occupation
        datetime created_at
    }
    
    LOANS {
        int id PK
        int user_id FK
        string loan_name
        string lender_name
        float outstanding_amount
        float interest_rate
        float emi
        string status
        datetime created_at
    }

    RECOMMENDATIONS {
        int id PK
        int user_id FK
        int loan_id FK
        float recommended_settlement_pct
        float recommended_monthly_payment
        float settlement_probability
        string stress_level
        string risk_level
        string priority_loans
        string recovery_advice
        datetime created_at
    }

    LETTERS {
        int id PK
        int user_id FK
        int loan_id FK
        string recipient_lender
        string letter_type
        float suggested_settlement_amount
        string suggested_installments
        string generated_content
        string status
        datetime created_at
    }
```
