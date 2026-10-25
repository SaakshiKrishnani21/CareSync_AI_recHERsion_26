// Talks to the CareSync backend (SQLite). No Firebase, no Google, no external accounts.
const tok = () => localStorage.getItem("cs_token");
let cb;
async function call(method, path, body) {
  const r = await fetch("/api" + path, { method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + (tok() || "") }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(r.status); return r.json();
}
const start = r => { localStorage.setItem("cs_token", r.token); cb(r.user); };
export const DEMO = {
  patient: { email: "demo.patient@caresync.app", password: "demo1234", profile: { role: "patient", name: "Neha Patil", age: 34, sex: "F", allergies: "Penicillin (rash)", meds: "Metformin 500mg twice daily", history: "Type 2 diabetes, 3 years" } },
  doctor: { email: "demo.doctor@caresync.app", password: "demo1234", profile: { role: "doctor", name: "Dr. Anjali Deshmukh", spec: "General Physician", city: "Nagpur", fee: 400, langs: "English, Hindi, Marathi", exp: 12 } }
};
export async function init(onUser) { cb = onUser; try { cb(tok() ? await call("GET", "/auth/me") : null); } catch { localStorage.removeItem("cs_token"); cb(null); } }
export const signUp = async (email, password, profile) => start(await call("POST", "/auth/signup", { email, password, profile }));
export const signIn = async (email, password) => start(await call("POST", "/auth/signin", { email, password }));
export async function demo(role) { const d = DEMO[role]; try { await signIn(d.email, d.password); } catch { await signUp(d.email, d.password, d.profile); } }
export async function signOut() { try { await call("POST", "/auth/signout"); } catch {} localStorage.removeItem("cs_token"); cb(null); }
export const saveProfile = (uid, patch) => call("PUT", "/profile", patch);
export const saveDoctor = (id, patch) => call("PUT", "/doctor/" + id, patch);
export const doctors = () => call("GET", "/doctors");
export const appts = filter => call("GET", "/appts?" + new URLSearchParams(filter));
export const slots = (doctorId, date) => call("GET", `/slots?doctorId=${doctorId}&date=${date}`);
export const adminOverview = () => call("GET", "/admin/overview");
export const adminDoctor = (id, status) => call("POST", "/admin/doctor/" + id, { status });
export const exportMe = () => call("GET", "/me/export");
export async function deleteMe() { await call("DELETE", "/me"); localStorage.removeItem("cs_token"); cb(null); }
export const addAppt = a => call("POST", "/appts", a);
export const updateAppt = (id, patch) => call("PATCH", "/appts/" + id, patch);
export const log = e => call("POST", "/log", e).catch(() => {});
export const config = () => call("GET", "/config");
export const google = async (credential, profile) => start(await call("POST", "/auth/google", { credential, profile }));
export const adminUsers = () => call("GET", "/admin/users");
export const adminAppts = () => call("GET", "/admin/appts");
export const adminSystem = () => call("GET", "/admin/system");
export const adminUser = (uid, disabled) => call("POST", "/admin/user/" + uid, { disabled });