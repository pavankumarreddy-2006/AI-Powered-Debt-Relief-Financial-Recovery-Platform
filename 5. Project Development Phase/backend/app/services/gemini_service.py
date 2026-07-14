import os
import json
import httpx
from typing import List, Dict, Any

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-1.5-flash"

def _call_gemini_http(prompt: str, json_mode: bool = False) -> str:
    """Helper method to make a direct HTTP call to the Gemini API (fallback/direct robust method)."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    if json_mode:
        payload["generationConfig"] = {"responseMimeType": "application/json"}
        
    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=60.0)
        response.raise_for_status()
        data = response.json()
        
        # Extract text response from Gemini's JSON structure
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return text
    except Exception as e:
        # If there's an error, try to fetch error details if response exists
        raise Exception(f"Gemini API HTTP request failed: {str(e)}")

def call_gemini(prompt: str, json_mode: bool = False) -> str:
    """Invokes Gemini API. Tries google-generativeai first, falls back to direct HTTP request."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        generation_config = {}
        if json_mode:
            generation_config["response_mime_type"] = "application/json"
            
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(
            prompt, 
            generation_config=generation_config
        )
        return response.text
    except Exception:
        # Fall back to raw HTTP call
        return _call_gemini_http(prompt, json_mode)

def get_recommendation(income: float, loans: List[Dict[str, Any]], stress_score: float) -> Dict[str, Any]:
    """Generates financial and settlement recommendations using Gemini."""
    prompt = f"""
    You are an expert financial recovery advisor specializing in debt settlement, borrower negotiation strategies, financial planning, and loan restructuring.
    Analyze the following borrower financial details and outstanding loans, and provide realistic, ethical, and structured debt relief advice.

    Borrower Monthly Income: ${income:.2f}
    Borrower Debt Stress Score: {stress_score:.1f} / 100

    Outstanding Loans:
    {json.dumps(loans, indent=2)}

    Based on this financial scenario, construct an analysis. Your response MUST be a valid JSON object matching the following structure:
    {{
        "stress_level": "Low" | "Medium" | "High" | "Severe",
        "settlement_probability": 0.0 to 1.0 (float reflecting probability of successful settlement),
        "recommended_settlement_pct": 30.0 to 60.0 (float percentage of outstanding amount to offer, e.g. 45.0),
        "expected_range": "e.g. 40% - 50%",
        "recommended_monthly_payment": float (suggested monthly installment under a restructured payment plan),
        "priority_loans": ["List of loan names that borrower should prioritize based on interest rates, status, or creditor aggressive level"],
        "risk_level": "Low" | "Medium" | "High",
        "recovery_advice": "Detailed paragraph of concrete financial recovery steps, budgeting methods (like 50/30/20), and strategy.",
        "financial_analysis": "An evaluation of the borrower's Debt-to-Income (DTI) ratio, monthly surplus, and overall debt load."
    }}
    """
    
    response_text = call_gemini(prompt, json_mode=True)
    try:
        return json.loads(response_text)
    except Exception:
        # Safe fallback parsing or direct manual mock structure if JSON failed
        return {
            "stress_level": "High" if stress_score > 60 else "Medium",
            "settlement_probability": 0.55,
            "recommended_settlement_pct": 45.0,
            "expected_range": "40% - 50%",
            "recommended_monthly_payment": income * 0.15,
            "priority_loans": [l.get("loan_name", "High Interest Loan") for l in loans][:2],
            "risk_level": "Medium",
            "recovery_advice": "Prioritize high-interest accounts. Target credit cards first using the debt avalanche method. Maintain a lean monthly budget.",
            "financial_analysis": f"Borrower has a high debt strain with a stress score of {stress_score}. Aggressive settlement negotiations are advised for overdue accounts."
        }

def get_negotiation_letter(user_profile: Dict[str, Any], loan: Dict[str, Any], letter_type: str, recipient_lender: str) -> Dict[str, Any]:
    """Generates negotiation strategies and letters using Gemini."""
    prompt = f"""
    You are an expert debt settlement attorney and empathetic financial recovery advisor.
    Generate a professional and legally-friendly negotiation letter/email proposing a debt settlement to a lender.
    The tone should be professional, respectful, firm yet empathetic, highlighting genuine hardship.

    Borrower Profile:
    - Name: {user_profile.get("full_name")}
    - Income: ${user_profile.get("monthly_income"):.2f} / month
    - Occupation: {user_profile.get("occupation")}
    - Phone: {user_profile.get("phone")}
    - Email: {user_profile.get("email")}

    Target Loan Details:
    - Loan Name: {loan.get("loan_name")}
    - Lender Name: {recipient_lender}
    - Outstanding Balance: ${loan.get("outstanding_amount"):.2f}
    - Original Amount: ${loan.get("original_amount"):.2f}
    - Monthly Payment (EMI): ${loan.get("emi"):.2f}
    - Overdue Duration: {loan.get("overdue_months")} months
    - Loan Status: {loan.get("status")}

    Letter Format Type: {letter_type} (either "Email Template" or "Settlement Request Letter")

    Your response MUST be a valid JSON object matching the following structure:
    {{
        "letter_content": "The full text of the letter/email, containing placeholders where necessary (like [Current Date]) but fully pre-filled with the borrower's details. Keep it realistic, professional, and clear.",
        "suggested_settlement_amount": float (the total dollar amount proposed for settlement, typically 40% to 50% of the outstanding amount),
        "suggested_installments": "description of proposed payment terms, e.g. Single lump-sum payment of $X within 30 days, or 6 monthly payments of $Y",
        "reasoning": "Brief explanation of why this specific proposal is optimal based on the borrower's hardship and outstanding balances.",
        "negotiation_points": [
            "Point 1: hardship justification",
            "Point 2: outline of settlement feasibility",
            "Point 3: leverage or credit bureau impact request"
        ]
    }}
    """
    
    response_text = call_gemini(prompt, json_mode=True)
    try:
        return json.loads(response_text)
    except Exception:
        suggested_amount = loan.get("outstanding_amount", 1000.0) * 0.45
        return {
            "letter_content": f"Dear {recipient_lender} Loss Mitigation Department,\n\nI am writing to request a formal settlement on my account ending in {loan.get('id')}. Due to financial hardship, my income of ${user_profile.get('monthly_income')} is insufficient to sustain the current monthly payments. I propose a settlement of ${suggested_amount:.2f} as full and final payment.\n\nSincerely,\n{user_profile.get('full_name')}",
            "suggested_settlement_amount": suggested_amount,
            "suggested_installments": "3 equal monthly installments",
            "reasoning": "Hardship proposal structured at 45% of total outstanding balance.",
            "negotiation_points": ["Highlight lack of assets", "Offer immediate initial payment", "Request 'Paid in Full' status reporting"]
        }

def chat_advisor(chat_history: List[Dict[str, str]], user_message: str) -> str:
    """Provides conversational AI financial advice based on chat history."""
    # Reconstruct the conversation history for the prompt
    history_str = ""
    for msg in chat_history[-10:]:  # Keep last 10 messages for context
        role = "Borrower" if msg["sender"] == "User" else "Advisor"
        history_str += f"{role}: {msg['message']}\n"
        
    prompt = f"""
    You are an expert AI Financial Recovery Advisor specializing in debt relief, loan settlement, and budgeting.
    Provide empathetic, practical, and legally-sound financial guidance to a borrower struggling with debt.
    Keep your responses direct, helpful, and concise (under 200 words). Do not give formal legal advice, but outline clear strategies (like Snowball vs. Avalanche, budgeting, debt consolidation, or settlement procedures).

    Conversation History:
    {history_str}
    Borrower: {user_message}
    Advisor:
    """
    
    try:
        return call_gemini(prompt, json_mode=False)
    except Exception as e:
        return f"I apologize, but I am having trouble connecting to my advisory systems. However, as a general rule: if you have multiple accounts, prioritize those with the highest interest rates (Avalanche) or settle the smallest accounts first for quick wins (Snowball). Please let me know how I can help once my systems are fully restored!"
