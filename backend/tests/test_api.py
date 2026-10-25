import json
from datetime import date, datetime, timedelta
from fastapi.testclient import TestClient
from main import app
c = TestClient(app)

def signup(email, role="patient", **p):
    r = c.post("/api/auth/signup", json={"email": email, "password": "secret1", "profile": {"role": role, "name": email.split("@")[0], **p}})
    return r, {"Authorization": "Bearer " + r.json().get("token", "")}

def next_day(wd=0):
    d = date.today() + timedelta(days=2)
    while d.weekday() != wd: d += timedelta(days=1)
    return d.isoformat()

def test_auth_and_throttle():
    assert signup("a@x.com")[0].status_code == 200 and signup("a@x.com")[0].status_code == 409
    assert c.get("/api/doctors").status_code == 401
    codes = [c.post("/api/auth/signin", json={"email": "a@x.com", "password": "bad"}).status_code for _ in range(10)]
    assert codes[0] == 401 and codes[-1] == 429

def test_ai_endpoints_need_login():
    assert c.post("/api/triage", json={"intake": {"symptoms": "x"}}).status_code == 401
    assert c.post("/api/chat", json={"messages": []}).status_code == 401

def test_doctor_verification_flow():
    assert signup("fake@x.com", "doctor", spec="Cardiologist", city="Pune")[0].status_code == 400          # no registration number
    r, dh = signup("doc@x.com", "doctor", spec="Cardiologist", city="Pune", reg_no="MH-12345", fee=500, langs="English", exp=3)
    did = r.json()["user"]["doctorId"]; assert r.json()["user"]["doctorStatus"] == "pending"
    _, ph = signup("p@x.com")
    assert did not in [d["id"] for d in c.get("/api/doctors", headers=ph).json()]                            # hidden until approved
    assert c.get(f"/api/appts?doctorId={did}", headers=dh).status_code == 403                                # cannot read patients yet
    assert c.post(f"/api/admin/doctor/{did}", json={"status": "approved"}, headers=dh).status_code == 403
    _, ah = signup("boss@x.com")
    assert c.get("/api/auth/me", headers=ah).json()["role"] == "admin"
    assert c.post(f"/api/admin/doctor/{did}", json={"status": "approved"}, headers=ah).status_code == 200
    assert did in [d["id"] for d in c.get("/api/doctors", headers=ph).json()]
    assert all("reg_no" not in d for d in c.get("/api/doctors", headers=ph).json())
    ov = c.get("/api/admin/overview", headers=ah).json(); assert any(a["act"] == "doctor_status" for a in ov["audit"])

def test_booking_slots_and_permissions():
    _, ph = signup("pat@x.com"); _, p2 = signup("pat2@x.com"); me = c.get("/api/auth/me", headers=ph).json()
    d = next_day(0)
    sl = c.get(f"/api/slots?doctorId=d1&date={d}", headers=ph).json(); assert sl and not sl[0]["taken"]
    assert c.get(f"/api/slots?doctorId=d1&date={next_day(6)}", headers=ph).json() == []                      # Sunday: not working
    assert c.get(f"/api/slots?doctorId=d1&date={(date.today() - timedelta(days=1)).isoformat()}", headers=ph).json() == []
    a = {"doctorId": "d1", "doctorName": "x", "date": d, "slot": sl[0]["t"], "level": "routine", "patientName": "x", "ai_used": False}
    r = c.post("/api/appts", json=a, headers=ph); assert r.status_code == 200
    assert c.post("/api/appts", json=a, headers=p2).status_code == 409                                       # double booking blocked
    assert c.post("/api/appts", json=a | {"slot": "03:33"}, headers=p2).status_code == 409                   # invalid slot
    aid = r.json()["id"]
    assert c.patch(f"/api/appts/{aid}", json={"status": "done"}, headers=ph).status_code == 403              # patient cannot self-complete
    assert c.patch(f"/api/appts/{aid}", json={"status": "cancelled"}, headers=p2).status_code == 403         # others cannot cancel
    assert c.get(f"/api/appts?patientId={me['uid']}", headers=p2).status_code == 403
    r2 = c.post("/api/auth/signup", json={"email": "demo.doctor@caresync.app", "password": "demo1234", "profile": {"role": "doctor", "name": "D"}}); dh = {"Authorization": "Bearer " + r2.json()["token"]}
    assert len(c.get("/api/appts?doctorId=d1", headers=dh).json()) == 1
    r = c.patch(f"/api/appts/{aid}", json={"status": "done", "feedback": "up", "consult": {"diagnosis": "Viral", "advice": "Rest"}}, headers=dh).json()
    assert r["status"] == "done" and r["feedback"] == "up" and r["consult"]["diagnosis"] == "Viral"

def test_export_and_delete():
    _, h = signup("gone@x.com"); assert c.get("/api/me/export", headers=h).json()["user"]["email"] == "gone@x.com"
    assert c.delete("/api/me", headers=h).status_code == 200 and c.get("/api/auth/me", headers=h).status_code == 401

def test_reschedule_and_reminders(monkeypatch):
    import api
    _, ph = signup("resch@x.com"); _, p2 = signup("resch2@x.com"); d = next_day(1)
    sl = [x["t"] for x in c.get(f"/api/slots?doctorId=d1&date={d}", headers=ph).json() if not x["taken"]]
    a = {"doctorId": "d1", "doctorName": "x", "date": d, "slot": sl[0], "level": "routine", "patientName": "x"}
    aid = c.post("/api/appts", json=a, headers=ph).json()["id"]
    assert c.patch(f"/api/appts/{aid}", json={"date": d, "slot": sl[1]}, headers=ph).json()["slot"] == sl[1]          # moved
    assert c.post("/api/appts", json=a, headers=p2).status_code == 200                                              # old slot is free again
    assert c.patch(f"/api/appts/{aid}", json={"date": d, "slot": sl[0]}, headers=ph).status_code == 409             # now taken
    assert c.patch(f"/api/appts/{aid}", json={"date": next_day(6), "slot": "10:00"}, headers=ph).status_code == 409  # closed day
    sent = []; monkeypatch.setattr(api, "_mail", lambda to, sub, body: sent.append(to) or True)
    soon = datetime.now() + timedelta(hours=3)
    with api.conn() as cx:
        uid = cx.execute("select uid from users where email='resch@x.com'").fetchone()["uid"]
        cx.execute("insert into appts values(?,?,?,?)", ("rem1", uid, "d1", json.dumps({"date": soon.date().isoformat(), "slot": soon.strftime("%H:%M"), "status": "booked", "doctorName": "x"})))
    assert api.send_reminders() == 1 and sent == ["resch@x.com"] and api.send_reminders() == 0                       # once only

def test_admin_pages_and_suspend():
    ah = {"Authorization": "Bearer " + c.post("/api/auth/signin", json={"email": "boss@x.com", "password": "secret1"}).json()["token"]}
    _, vh = signup("victim@x.com")
    uid = [u for u in c.get("/api/admin/users", headers=ah).json() if u["email"] == "victim@x.com"][0]["uid"]
    assert c.get("/api/admin/users", headers=vh).status_code == 403 and c.get("/api/admin/appts", headers=vh).status_code == 403
    assert c.post(f"/api/admin/user/{uid}", json={"disabled": True}, headers=ah).status_code == 200
    assert c.get("/api/auth/me", headers=vh).status_code == 403                                               # suspended: old session blocked
    assert c.post("/api/auth/signin", json={"email": "victim@x.com", "password": "secret1"}).status_code == 403
    me = c.get("/api/auth/me", headers=ah).json()["uid"]; assert c.post(f"/api/admin/user/{me}", json={"disabled": True}, headers=ah).status_code == 400
    assert c.post(f"/api/admin/user/{uid}", json={"disabled": False}, headers=ah).status_code == 200
    assert c.post("/api/auth/signin", json={"email": "victim@x.com", "password": "secret1"}).status_code == 200
    assert isinstance(c.get("/api/admin/appts", headers=ah).json(), list) and "email_enabled" in c.get("/api/admin/system", headers=ah).json()