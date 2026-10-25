import os, time
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel
from triage import graph, scan, LANG_NAMES

from api import router, current, start_reminders
app = FastAPI(title="CareSync AI")
app.include_router(router)
start_reminders()

@app.middleware("http")
async def security_headers(request, call_next):
    r = await call_next(request)
    r.headers.update({"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "same-origin"})
    return r

_hits: dict = {}
def rate(request: Request, bucket: str, limit: int):
    """Per-IP limit per minute, so nobody can run up your AI bill."""
    k, now = (bucket, request.client.host if request.client else "?"), time.time()
    q = [x for x in _hits.get(k, []) if now - x < 60]
    if len(q) >= limit: raise HTTPException(429, "Too many requests. Please slow down.")
    _hits[k] = q + [now]
_tr_cache: dict = {}

class Intake(BaseModel):
    model_config = {"extra": "allow"}  # new intake fields flow straight through to triage
    symptoms: str
    duration: str = ""
    severity: int = 5
    age: int | None = None
    sex: str = ""
    pregnant: bool = False
    allergies: str = ""
    medications: str = ""
    history: str = ""

class TriageReq(BaseModel):
    intake: Intake
    lang: str = "en"

class Msg(BaseModel):
    role: str
    content: str

class ChatReq(BaseModel):
    messages: list[Msg]
    lang: str = "en"

@app.post("/api/triage")
def triage(req: TriageReq, request: Request, authorization: str = Header("")):
    current(authorization); rate(request, "triage", 20)
    r = graph.invoke({"intake": req.intake.model_dump(), "lang": req.lang})
    return {"level": r["level"], "reasons": r["reasons"], "report": r["report"], "message": r["message"],
            "selfharm": any(h["id"] == "selfharm" for h in r["hits"]), "ai_used": bool(r.get("ai"))}

EMERGENCY = {"en": "This sounds serious. Please call 112 now or go to the nearest hospital. Do not wait for an appointment.",
             "hi": "यह गंभीर लग रहा है। कृपया अभी 112 पर कॉल करें या नज़दीकी अस्पताल जाएँ। अपॉइंटमेंट का इंतज़ार न करें।",
             "mr": "हे गंभीर वाटते. कृपया लगेच 112 वर कॉल करा किंवा जवळच्या रुग्णालयात जा. अपॉइंटमेंटची वाट पाहू नका."}

CHAT_SYSTEM = """You are CareSync Assistant, a warm health-navigation helper for patients in India.
You help with: choosing a doctor specialty (General Physician, Cardiologist, Gynecologist, Pediatrician, Neurologist,
Pulmonologist, Dermatologist, Psychiatrist), how booking and pre-visit intake work, and general non-diagnostic guidance.
Never diagnose, never prescribe doses. For anything that sounds dangerous say: call 112. Keep answers under 80 words.
Always reply in {language}."""

def _hint(e: Exception) -> str:
    m = str(e).lower()
    if "401" in m or "authentication" in m or "api key" in m or "x-api-key" in m: return "Fix: ANTHROPIC_API_KEY in backend/.env is missing or invalid."
    if "credit" in m or "billing" in m or "402" in m: return "Fix: your Anthropic account has no credit. Add credit at console.anthropic.com."
    if "404" in m or "not_found" in m or "model" in m: return "Fix: check CLAUDE_MODEL in backend/.env."
    if "connect" in m or "timeout" in m or "resolve" in m: return "Fix: no internet connection to api.anthropic.com."
    return "See the terminal for details."

@app.get("/api/health")
def health():
    """Open http://localhost:8000/api/health to test the AI connection."""
    key = os.getenv("ANTHROPIC_API_KEY", "")
    out = {"key_loaded": bool(key) and key != "your-key-here", "model": os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5"), "google_signin_enabled": bool(os.getenv("GOOGLE_CLIENT_ID"))}
    try:
        ChatAnthropic(model=out["model"], max_tokens=20).invoke("Say OK")
        out["ai"] = "working"
    except Exception as e:
        out["ai"] = "failed"; out["problem"] = _hint(e)
        if os.getenv("DEBUG"): out["detail"] = str(e)[:300]
    return out

@app.post("/api/chat")
def chat(req: ChatReq, request: Request, authorization: str = Header("")):
    current(authorization); rate(request, "chat", 30)
    last = req.messages[-1].content if req.messages else ""
    if any(h["level"] == "emergency" for h in scan(last, pregnant=True)):
        return {"reply": EMERGENCY.get(req.lang, EMERGENCY["en"]), "emergency": True}
    try:
        llm = ChatAnthropic(model=os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5"))
        out = llm.invoke([("system", CHAT_SYSTEM.format(language=LANG_NAMES.get(req.lang, "English")))] + [(m.role, m.content) for m in req.messages[-10:]])
        return {"reply": out.content, "emergency": False}
    except Exception as e:
        print("CHAT ERROR:", repr(e))
        return {"reply": "I can't reach the AI right now. " + _hint(e) + " For emergencies call 112.", "emergency": False}

class TrReq(BaseModel):
    lang: str
    strings: dict

@app.post("/api/translate")
def translate(req: TrReq, request: Request):
    """Translate the whole UI into any language once; the browser caches the result."""
    import json, re
    ck = (req.lang, hash(json.dumps(req.strings, sort_keys=True)))
    if ck in _tr_cache: return _tr_cache[ck]
    rate(request, "translate", 8)
    try:
        llm = ChatAnthropic(model=os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5"), max_tokens=8000)
        out = llm.invoke([("system", f"Translate the JSON values from English to {LANG_NAMES.get(req.lang, req.lang)}. Keep every key and every {{n}} placeholder unchanged. Keep 'SOS', '112', '108', '14416', 'CareSync', and the rupee sign as they are. Return only valid JSON, no code fences."),
                          ("user", json.dumps(req.strings, ensure_ascii=False))])
        res = json.loads(re.sub(r"^```(?:json)?|```$", "", out.content.strip(), flags=re.M).strip()); _tr_cache[ck] = res; return res
    except Exception as e:
        print("translate failed:", e)
        return {}

app.mount("/", StaticFiles(directory=Path(__file__).resolve().parent.parent / "frontend", html=True), name="web")