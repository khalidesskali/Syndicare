import json
import logging
import re
import google.generativeai as genai
from django.conf import settings
from django.utils import timezone

from ..models import Reclamation


logger = logging.getLogger(__name__)

if getattr(settings, "GEMINI_API_KEY", None):
    genai.configure(api_key=settings.GEMINI_API_KEY)


def _get_supported_model_names():
    try:
        models = genai.list_models()
    except Exception:
        logger.exception("Failed to list Gemini models")
        return []

    supported = []
    for m in models:
        try:
            methods = getattr(m, "supported_generation_methods", []) or []
            if "generateContent" in methods:
                name = getattr(m, "name", None)
                if name:
                    supported.append(name)
        except Exception:
            continue

    return supported


def _select_model_name():
    preferred = getattr(settings, "GEMINI_MODEL_NAME", None)
    supported = _get_supported_model_names()

    if preferred:
        # Accept either full names like "models/..." or short names.
        if preferred in supported:
            return preferred
        preferred_full = preferred if preferred.startswith("models/") else f"models/{preferred}"
        if preferred_full in supported:
            return preferred_full
        logger.warning(
            "Configured GEMINI_MODEL_NAME=%r is not in supported models. Falling back.",
            preferred,
        )

    if supported:
        return supported[0]

    return None


ALLOWED_CATEGORIES = [
    "PLUMBING", "ELECTRICITY", "NOISE", "SECURITY",
    "ELEVATOR", "CLEANLINESS", "ADMINISTRATIVE",
    "PARKING", "OTHER"
]

URGENCY_TO_PRIORITY = {
    "low": "LOW",
    "medium": "MEDIUM",
    "high": "HIGH",
    "critical": "URGENT",
}

ALLOWED_DEPARTMENTS = [
    "MAINTENANCE", "SECURITY", "ADMINISTRATION",
    "FINANCE", "CLEANING", "MANAGEMENT"
]


SYSTEM_PROMPT = """
You are an AI triage engine for a property management platform.

You MUST output EXACTLY one JSON object and nothing else.
No markdown.
No code fences.
No explanations.
No additional text.

All enum fields MUST be selected from the allowed values below.
If you are unsure, use the specified default.

Allowed values:

category (choose exactly one; default OTHER):
PLUMBING | ELECTRICITY | NOISE | SECURITY | ELEVATOR | CLEANLINESS | ADMINISTRATIVE | PARKING | OTHER

urgency_level (choose exactly one; default medium):
low | medium | high | critical

suggested_department (choose exactly one; default MANAGEMENT):
MAINTENANCE | SECURITY | ADMINISTRATION | FINANCE | CLEANING | MANAGEMENT

Rules:
- Prefer the most specific category rather than OTHER.
- If there is immediate danger, fire risk, flooding, or safety threat: urgency_level=critical.
- priority_score and confidence_score must be numbers in [0.0, 1.0].
- summary must be one short sentence.

Structure:

{
  "category": "",
  "urgency_level": "",
  "priority_score": 0.0,
  "summary": "",
  "suggested_department": "",
  "sentiment": "",
  "confidence_score": 0.0
}
"""


def build_prompt(reclamation: Reclamation):
    return f"""
Complaint:
{reclamation.content}

Title:
{reclamation.title}
"""


def validate_ai_output(data: dict):
    if data.get("category", "").upper() not in ALLOWED_CATEGORIES:
        data["category"] = "OTHER"

    urgency = data.get("urgency_level", "medium").lower()
    priority = URGENCY_TO_PRIORITY.get(urgency, "MEDIUM")

    if data.get("suggested_department", "").upper() not in ALLOWED_DEPARTMENTS:
        data["suggested_department"] = "MANAGEMENT"

    try:
        priority_score = float(data.get("priority_score", 0.5))
    except:
        priority_score = 0.5

    try:
        confidence_score = float(data.get("confidence_score", 0.5))
    except:
        confidence_score = 0.5

    return {
        "category": data["category"].upper(),
        "ai_urgency_level": urgency,
        "priority": priority,
        "priority_score": max(0, min(priority_score, 1)),
        "ai_summary": data.get("summary", ""),
        "suggested_department": data["suggested_department"].upper(),
        "sentiment": data.get("sentiment", ""),
        "confidence_score": max(0, min(confidence_score, 1)),
    }


def _apply_fallback_triage(reclamation: Reclamation):
    # Minimal safe defaults (ensures UI doesn't remain in "AI processing" forever)
    reclamation.category = reclamation.category or "OTHER"
    reclamation.ai_urgency_level = reclamation.ai_urgency_level or "medium"
    reclamation.priority = reclamation.priority or "MEDIUM"
    reclamation.priority_score = reclamation.priority_score if reclamation.priority_score is not None else 0.5
    reclamation.ai_summary = reclamation.ai_summary or ""
    reclamation.suggested_department = reclamation.suggested_department or "MANAGEMENT"
    reclamation.sentiment = reclamation.sentiment or ""
    reclamation.confidence_score = reclamation.confidence_score if reclamation.confidence_score is not None else 0.0
    reclamation.ai_processed = True
    reclamation.ai_processed_at = timezone.now()
    reclamation.save()


def _strip_code_fences(text: str) -> str:
    if not text:
        return ""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _extract_first_json_object(text: str):
    """Extract and parse the first JSON object found anywhere in text.

    Uses JSONDecoder.raw_decode so it can handle leading/trailing non-JSON.
    Returns a dict or None.
    """

    cleaned = _strip_code_fences(text)
    if not cleaned:
        return None

    decoder = json.JSONDecoder()
    start = cleaned.find("{")
    while start != -1:
        try:
            obj, _end = decoder.raw_decode(cleaned[start:])
            if isinstance(obj, dict):
                return obj
        except json.JSONDecodeError:
            pass
        start = cleaned.find("{", start + 1)

    return None


def process_reclamation_ai(reclamation_id: int):
    reclamation = Reclamation.objects.get(id=reclamation_id)

    if not getattr(settings, "GEMINI_API_KEY", None):
        logger.warning(
            "GEMINI_API_KEY is not configured; applying fallback triage (reclamation_id=%s)",
            reclamation_id,
        )
        _apply_fallback_triage(reclamation)
        return

    model_name = _select_model_name()
    if not model_name:
        logger.error(
            "No Gemini models available that support generateContent (reclamation_id=%s)",
            reclamation_id,
        )
        _apply_fallback_triage(reclamation)
        return

    try:
        model = genai.GenerativeModel(model_name)
    except Exception:
        logger.exception(
            "Failed to initialize Gemini model (reclamation_id=%s, model_name=%s)",
            reclamation_id,
            model_name,
        )
        _apply_fallback_triage(reclamation)
        return

    def _call_gemini(extra_instruction: str = ""):
        prompt = SYSTEM_PROMPT + "\n" + extra_instruction + "\n" + build_prompt(reclamation)
        return model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 512,
            },
        )

    try:
        response = _call_gemini()
    except Exception:
        logger.exception("Gemini triage failed during generate_content (reclamation_id=%s)", reclamation_id)
        _apply_fallback_triage(reclamation)
        return

    raw_text = getattr(response, "text", None) or ""
    if not raw_text.strip():
        logger.error("Gemini triage returned empty response (reclamation_id=%s)", reclamation_id)
        _apply_fallback_triage(reclamation)
        return

    data = _extract_first_json_object(raw_text)

    if data is None:
        # Retry once with stricter instruction
        try:
            response2 = _call_gemini(
                "Return ONLY a single JSON object. Do not use markdown/code fences. Do not truncate."
            )
            raw2 = getattr(response2, "text", None) or ""
            data = _extract_first_json_object(raw2)
        except Exception:
            data = None

    if data is None:
        logger.error(
            "Gemini triage returned non-JSON response (reclamation_id=%s, text=%r)",
            reclamation_id,
            raw_text[:1000],
        )
        _apply_fallback_triage(reclamation)
        return

    validated = validate_ai_output(data)

    for key, value in validated.items():
        setattr(reclamation, key, value)

    reclamation.ai_processed = True
    reclamation.ai_processed_at = timezone.now()
    reclamation.save()

    logger.info(
        "Gemini triage success (reclamation_id=%s, category=%s, priority=%s, score=%s)",
        reclamation_id,
        reclamation.category,
        reclamation.priority,
        reclamation.priority_score,
    )