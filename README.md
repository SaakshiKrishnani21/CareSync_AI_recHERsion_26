# CareSync AI — Smarter Preparation. Safer Care.

## Easiest start (Windows)
Double-click `start.bat`. It installs what is needed, creates `backend\.env`, starts the app and opens your browser. Add your Anthropic key to `backend\.env` for AI reports and the assistant.

## Run manually
```
cd backend
python -m venv venv && venv\Scripts\activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env                              # Mac/Linux: cp   then edit .env
uvicorn main:app --port 8000
```
Open http://localhost:8000. Check the AI connection at /api/health. Reset all data: stop the server, delete backend/caresync.db.
**Docker:** `docker compose up -d --build` (data persists in a volume). Put it behind HTTPS (Caddy, nginx or your host's TLS) before real use.

## Roles
- **Patient:** sign up, save health profile once, find doctors, see Records (visit summaries and prescriptions), book through a four-step intake (danger signs are checked first and stop the booking immediately), reschedule or cancel, appointments, calendar file, assistant, SOS, export or delete own data.
- **Doctor:** signs up with a medical registration number and is **pending** until an admin approves. Approved doctors set working days, hours and visit length, see their urgency-sorted queue, complete visits (notes and prescription become a plain-language summary in the patient's language) and rate each AI summary.
- **Admin:** any email listed in `ADMIN_EMAILS` (sign up normally with it). Five pages: Overview (usage, emergencies caught, AI accuracy, activity log), Doctors (approve or reject), People (search, suspend or restore accounts), All appointments (filter by status), System (AI, email and Google status, AI connection test).
Demo buttons: patient, and a pre-approved doctor.

## Email confirmations and reminders (optional)
Fill `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `backend/.env` (Gmail: host `smtp.gmail.com`, port 587, and an App Password). Patients then get an email on booking and rescheduling, and a reminder within 24 hours of the visit. Leave blank to skip.

## Safety and privacy built in
Rules plus AI triage that never downgrades; symptom checklist and vitals thresholds; infant fever rule; names and phone numbers are never sent to the AI; patient text is treated as untrusted; the report says when the AI was unavailable. Passwords hashed (PBKDF2), sessions expire after 30 days, login throttling, per-IP limits on AI endpoints, security headers, doctors only see their own patients and only after verification, audit log of record access, consent timestamp on every booking, data export and account deletion.

## Tests
```
pip install -r requirements-dev.txt
cd backend && python -m pytest tests -q
```
45 tests: 25 scripted emergency scenarios in English, Hindi, Marathi and Hinglish (all must be flagged), urgent and routine cases, and every permission and booking rule.

## Before real patients use it (needs people, not code)
Have a licensed clinician review the red-flag list and thresholds; get legal advice on DPDP Act 2023 and telemedicine rules; host with HTTPS and automated backups; move to Postgres at scale. Not built: SMS/WhatsApp reminders (email only), uploading reports with OCR, family profiles (book for a parent or child), payments, video consults. Doctor registration numbers are checked by a human admin, not against the NMC registry.