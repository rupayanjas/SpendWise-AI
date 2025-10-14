from __future__ import annotations

"""AI Advice router for SpendWise AI.

Endpoint:
- POST /advice: Accepts a prompt (and optional context) and returns AI-generated advice

Notes:
- Uses get_current_user to associate requests to the authenticated user
- Optionally logs the prompt/response in AdviceRequest table
- External AI call placeholder uses OpenAI-like API; replace with your provider
"""

import os
from typing import Annotated, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.db import get_session
from app.models import AdviceRequest, User
from app.routers.auth import get_current_user
from app.schemas import AdviceRequestSchema, AdviceResponseSchema

router = APIRouter(prefix="/advice", tags=["advice"])


async def call_external_ai_api(prompt: str, context: Optional[dict] = None) -> str:
    """Call an external AI API asynchronously and return advice text.

    Replace this with your AI provider. This sample uses an OpenAI-compatible
    endpoint shape via HTTPX. Expects environment variables:
      - AI_API_BASE (e.g., https://api.openai.com/v1)
      - AI_API_KEY (Bearer token)
      - AI_MODEL (e.g., gpt-4o-mini)
    """
    api_base = os.getenv("AI_API_BASE", "https://api.openai.com/v1")
    api_key = os.getenv("AI_API_KEY")
    model = os.getenv("AI_MODEL", "gpt-4o-mini")

    if not api_key:
        # Fallback: no key configured
        return (
            "Based on your prompt, focus on tracking expenses, setting a monthly budget, "
            "and maintaining an emergency fund of 3–6 months of expenses."
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "system", "content": "You are a helpful financial budgeting assistant."},
        {"role": "user", "content": prompt},
    ]
    if context:
        messages.append({"role": "user", "content": f"Context: {context}"})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 300,
    }

    async with httpx.AsyncClient(base_url=api_base, timeout=30.0) as client:
        try:
            resp = await client.post("/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            # OpenAI chat response shape
            advice_text = data["choices"][0]["message"]["content"].strip()
            return advice_text
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"AI provider error: {exc}")


@router.post("/", response_model=AdviceResponseSchema)
async def generate_advice(
    req: AdviceRequestSchema,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Generate AI budgeting advice from a prompt (and optional context).

    Returns:
      { "advice": "..." }
    """
    advice_text = await call_external_ai_api(req.prompt, req.context)

    # Optional: log to DB
    log = AdviceRequest(user_id=current_user.id, prompt=req.prompt, response=advice_text)
    session.add(log)
    await session.commit()

    return AdviceResponseSchema(advice=advice_text)
