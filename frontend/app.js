import * as db from "./db.js";
import { LANGS, STATIC, EN, SPECS } from "./i18n.js";

const $ = s => document.querySelector(s), root = $("#root");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const RANK = { routine: 0, soon: 1, urgent: 2, emergency: 3 };
const SLOTS = ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "16:00"];
const P = { home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5", cal: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0", chat: "M4 5h16v11H9l-5 4z", queue: "M4 6h16M4 12h16M4 18h10", pulse: "M3 12h4l3-8 4 16 3-8h4", file: "M6 3h9l4 4v14H6zM9 12h7M9 16h7" };
const ic = n => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]}"/></svg>`;

const S = { user: null, view: "home", lang: localStorage.getItem("cs_lang") || "en", dict: EN, doctors: [], appts: [], book: null, draft: {}, result: null,
  emergency: null, gid: "", chat: [], typing: false, authTab: "signin", role: "patient", q: "", fs: "", fc: "", qtab: "pending" };
const t = (k, v = {}) => (S.dict[k] ?? EN[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? "");
const specName = s => SPECS.includes(s) ? t("sp_" + SPECS.indexOf(s)) : s;
const toast = m => { const d = document.createElement("div"); d.className = "toast"; d.textContent = m; document.body.append(d); setTimeout(() => d.remove(), 2600); };
const api = (p, body) => fetch(p, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + (localStorage.getItem("cs_token") || "") }, body: JSON.stringify(body) }).then(r => r.json());
const download = (name, text, type) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); };

const DEMOS = [
  { doc: "d1", d: { age: 34, sex: "F", symptoms: "Throbbing headache on the front for 5 days, worse in the evening. Nausea and light hurts my eyes. No fever.", duration: "5 days", severity: 6, body: "head", onset: "gradual", course: "worse",
    modifiers: "Worse in bright light and in the evening, rest helps a little", tried: "Paracetamol 500mg twice a day, little relief", sym_headache: true, sym_nausea: true, temp: "36.9", bp_sys: "128", bp_dia: "82", pulse: "78", spo2: "98",
    height: "160", weight: "64", blood: "B+", cond_diabetes: true, family: "Mother has migraine", allergies: "Penicillin (rash)", meds: "Metformin 500mg twice daily", ec_name: "Amit Patil", ec_phone: "9876543210" } },
  { doc: "d2", d: { age: 58, sex: "M", symptoms: "सीने में दर्द है और बाएँ हाथ में भी खिंचाव। पसीना आ रहा है।", duration: "30 minutes", severity: 8, body: "chest", onset: "sudden", course: "worse", sym_palpitations: true, sym_dizzy: true,
    temp: "36.8", bp_sys: "170", bp_dia: "100", pulse: "104", spo2: "95", height: "170", weight: "82", blood: "O+", cond_bp: true, cond_diabetes: true, smoking: "daily", family: "Father had a heart attack at 55", allergies: "None", meds: "Amlodipine 5mg", ec_name: "Sunita", ec_phone: "9123456780" } },
  { doc: "d3", d: { age: 29, sex: "F", pregnant: true, preg_weeks: "30", preg_issues: "Headache and swelling in feet for a week", symptoms: "7 months pregnant. Some bleeding since morning and the baby is moving less than usual.", duration: "Since morning", severity: 7,
    body: "abdomen", onset: "sudden", course: "worse", sym_swelling: true, temp: "37.0", bp_sys: "146", bp_dia: "96", pulse: "92", spo2: "98", height: "158", weight: "70", blood: "A+", allergies: "None", meds: "Iron and folic acid", history: "First pregnancy", ec_name: "Rahul", ec_phone: "9988776655" } }];

// ---------- language ----------
async function setLang(c) {
  S.lang = c; localStorage.setItem("cs_lang", c);
  document.documentElement.lang = c; document.documentElement.dir = c === "ur" ? "rtl" : "ltr";
  let cache = {}; try { cache = JSON.parse(localStorage.getItem("cs_ui_" + c) || "{}"); } catch {}
  const build = () => ({ ...EN, ...(STATIC[c] || {}), ...cache });
  S.dict = build();
  const missing = c === "en" ? [] : Object.keys(EN).filter(k => !(STATIC[c] && k in STATIC[c]) && !(k in cache));
  if (missing.length) {   // translate only what we don't have yet, then remember it
    render(); toast(t("translating"));
    try { const r = await api("/api/translate", { lang: c, strings: Object.fromEntries(missing.map(k => [k, EN[k]])) });
      if (r && typeof r === "object" && !r.detail) { cache = { ...cache, ...r }; localStorage.setItem("cs_ui_" + c, JSON.stringify(cache)); S.dict = build(); } } catch {}
  }
  render();
}
const langSel = (cls = "") => `<select class="${cls}" data-lang aria-label="Language">${Object.entries(LANGS).map(([c, n]) => `<option value="${c}" ${c === S.lang ? "selected" : ""}>${n}</option>`).join("")}</select>`;
const brand = () => `<div class="brand"><svg width="30" height="30" viewBox="0 0 30 30"><rect width="30" height="30" rx="7" fill="#0b5563"/><path d="M15 7v16M7 15h16" stroke="#fff" stroke-width="3.5"/></svg><span>CareSync <i>AI</i></span></div>`;

// ---------- auth screen ----------
function authView() {
  const su = S.authTab === "signup", dr = S.role === "doctor";
  return `<div class="auth"><section class="aside">${brand()}<h1>${t("app_tag")}</h1><ul><li>${t("feat1")}</li><li>${t("feat2")}</li><li>${t("feat3")}</li></ul></section>
  <section class="amain">${langSel("lg")}<form class="abox" data-form="auth">
   <div class="tabs"><button type="button" class="${su ? "" : "on"}" data-act="atab" data-v="signin">${t("signin")}</button><button type="button" class="${su ? "on" : ""}" data-act="atab" data-v="signup">${t("signup")}</button></div>
   ${su ? `<div class="tabs"><button type="button" class="${dr ? "" : "on"}" data-act="role" data-v="patient">${t("i_patient")}</button><button type="button" class="${dr ? "on" : ""}" data-act="role" data-v="doctor">${t("i_doctor")}</button></div>
    <label><span>${t("fullname")}</span><input name="name" required></label>` : ""}
   <label><span>${t("email")}</span><input type="email" name="email" required autocomplete="username"></label>
   <label><span>${t("password")}</span><input type="password" name="password" minlength="6" required autocomplete="${su ? "new" : "current"}-password"></label>
   ${su && dr ? `<label><span>${t("spec")}</span><select name="spec">${SPECS.map(s => `<option value="${s}">${specName(s)}</option>`).join("")}</select></label>
    <div class="row" style="grid-template-columns:1fr 1fr"><label><span>${t("city")}</span><input name="city" required></label><label><span>${t("fee")}</span><input type="number" name="fee" value="500"></label></div>
    <label><span>${t("langs_spoken")}</span><input name="langs" value="English, Hindi"></label><label><span>${t("reg_no")}</span><input name="reg_no" required></label>` : ""}
   <button class="btn wide">${su ? t("signup") : t("signin")}</button>${S.gid ? `<div class="divider">${t("or")}</div><div id="gbtn" style="display:flex;justify-content:center"></div>` : ""}<div class="divider">${t("or")}</div>
   <div class="demos"><button type="button" class="btn ghost" data-act="demo" data-v="patient">${t("demo_patient")}</button><button type="button" class="btn ghost" data-act="demo" data-v="doctor">${t("demo_doctor")}</button></div>
   <p class="muted small">${t("disclaimer")}</p></form></section></div>`;
}

// ---------- shell ----------
function shell() {
  const dr = S.user.role === "doctor";
  const nav = S.user.role === "admin" ? [["admin", "pulse", "nav_overview"], ["adoctors", "user", "adm_doctors"], ["ausers", "queue", "nav_users"], ["aappts", "cal", "nav_allappts"], ["asys", "file", "nav_system"]] : dr ? [["queue", "queue", "nav_queue"], ["dprofile", "user", "nav_dprofile"]] : [["home", "home", "nav_home"], ["find", "search", "nav_find"], ["appts", "cal", "nav_appts"], ["records", "pulse", "nav_records"], ["profile", "file", "nav_profile"], ["chat", "chat", "nav_chat"]];
  const views = { home: homeView, find: findView, book: bookView, appts: apptsView, profile: profileView, dprofile: profileView, chat: chatView, queue: queueView, admin: adminView, adoctors: adoctorsView, ausers: ausersView, aappts: aapptsView, asys: asysView, records: recordsView };
  return `<div class="app"><aside class="side">${brand()}<nav>${nav.map(([v, i, k]) => `<button class="nv ${S.view === v || (S.view === "book" && v === "find") ? "on" : ""}" data-act="go" data-v="${v}">${ic(i)}<span>${t(k)}</span></button>`).join("")}</nav></aside>
  <div><header class="topbar"><b>${esc(S.user.name)}</b><div class="tools">${langSel()}${S.user.role !== "patient" ? "" : `<button class="btn red sm" data-act="sos">${t("sos")}</button>`}<button class="btn ghost sm" data-act="out">${t("signout")}</button></div></header>
  <div class="content">${views[S.view]()}</div></div></div>${overlay()}`;
}
function overlay() {
  const e = S.emergency; if (!e) return "";
  return `<div class="overlay" role="alertdialog"><div class="ob"><h2>${t("em_title")}</h2>${e.message ? `<p style="font-size:18px">${esc(e.message)}</p>` : ""}
  <div class="oa"><a class="btn red" href="tel:112">${t("call112")}</a><a class="btn red" href="tel:108">${t("call108")}</a>
  <a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/search/emergency+hospital+near+me">${t("hospitals")}</a></div>
  ${e.selfharm ? `<p><b>${t("helpline")}</b></p>` : ""}${(e.reasons || []).length ? `<b>${t("why")}</b><ul>${e.reasons.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
  <button class="btn ghost" data-act="closeem">${t("back")}</button></div></div>`;
}

// ---------- shared pieces ----------
function tag(a, doctorView) {
  const r = a.report || {}, row = (k, v) => v ? `<dt>${t(k)}</dt><dd>${esc(v)}</dd>` : "", c = a.consult;
  const who = doctorView ? `${esc(a.patientName)}${a.intake?.age ? ", " + a.intake.age : ""}` : `${esc(a.doctorName)}`;
  const consult = c ? `<div class="consult"><b>${t(doctorView ? "doc_notes" : "visit_summary")}</b><p>${esc(doctorView ? [c.diagnosis, c.advice].filter(Boolean).join(" · ") : c.summary || [c.diagnosis, c.advice].filter(Boolean).join(" · "))}</p>
    ${c.prescription ? `<p><b>${t("prescription")}:</b> ${esc(c.prescription)}</p>` : ""}${c.followup ? `<p class="small">${t("followup")}: ${esc(c.followup)}</p>` : ""}</div>` : "";
  const fb = doctorView ? `<p class="small">${t("accurate")} ${["up", "down"].map(v => `<button class="chip ${a.feedback === v ? "on" : ""}" data-act="fb" data-id="${a.id}" data-v="${v}">${v === "up" ? "👍" : "👎"}</button>`).join("")}</p>` : "";
  const form = doctorView && S.consult === a.id ? `<form class="form" data-form="consult" data-id="${a.id}" style="margin-top:10px">
    <label><span>${t("diagnosis")}</span><textarea name="diagnosis" rows="2" required></textarea></label><label><span>${t("advice")}</span><textarea name="advice" rows="2"></textarea></label>
    <label><span>${t("prescription")}</span><textarea name="prescription" rows="2"></textarea></label><label><span>${t("followup")}</span><input name="followup" placeholder="7 days"></label><div><button class="btn sm">${t("save_visit")}</button></div></form>` : "";
  return `<article class="tag lvl-${a.level} ${a.status === "cancelled" ? "done" : ""}"><div class="band"><span>${t("lvl_" + a.level)}</span><small>${who} · ${esc(a.date)} ${esc(a.slot)}</small></div>
  ${!doctorView && a.message ? `<p>${esc(a.message)}</p>` : ""}${a.ai_used === false ? `<p class="small" style="color:var(--soon)"><b>${t("rules_only")}</b></p>` : ""}${!doctorView ? consult : ""}
  <dl>${row("rl_chief", r.chief_complaint)}${row("rl_history", r.history_of_present_illness)}${row("rl_onset", r.onset_and_course)}${row("rl_assoc", r.associated_symptoms)}${row("rl_vitals", r.vitals)}${row("rl_risk", r.risk_factors)}${row("rl_flags", r.red_flags_screened)}
  ${row("rl_allergies", r.allergies)}${row("rl_meds", r.medications)}${row("rl_past", r.past_history)}${row("rl_q", (r.questions_for_doctor || []).join(" · "))}${doctorView ? row("rl_contact", [a.intake?.ec_name, a.intake?.ec_phone].filter(Boolean).join(" · ")) : ""}</dl>
  <details><summary>${t("why")}</summary><ul>${(a.reasons || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>${doctorView ? consult : ""}${fb}
  <p class="muted small">${t("pr_note")}</p>${form}
  ${doctorView && a.status === "booked" && S.consult !== a.id ? `<button class="btn sm" data-act="consult" data-id="${a.id}">${t("complete_visit")}</button>` : ""}
  ${!doctorView && a.status === "booked" && S.resched === a.id ? `<div class="consult"><label><span>${t("date")}</span><input type="date" id="rdate" value="${S.rdate}" min="${new Date().toISOString().slice(0, 10)}"></label><div class="slots" id="rslots" style="margin:10px 0"></div><button class="btn sm" data-act="rsave" data-id="${a.id}">${t("confirm")}</button> <button class="btn ghost sm" data-act="rclose">${t("back")}</button></div>` : ""}
  ${!doctorView && a.status === "booked" && S.resched !== a.id ? `<button class="btn sm" data-act="ics" data-id="${a.id}">${t("cal")}</button><button class="btn ghost sm" data-act="resched" data-id="${a.id}">${t("resched")}</button><button class="btn ghost sm" data-act="cancel" data-id="${a.id}">${t("cancel")}</button>` : ""}
  ${a.status === "cancelled" ? `<b>${t("cancelled")}</b>` : ""}${a.status === "done" ? `<b>${t("seen")}</b>` : ""}</article>`;
}
async function loadRSlots() {
  const el = $("#rslots"), ap = S.appts.find(x => x.id === S.resched); if (!el || !ap) return;
  const list = await db.slots(ap.doctorId, S.rdate).catch(() => []);
  el.innerHTML = list.length ? list.map(x => `<label class="slot"><input type="radio" name="rslot" value="${x.t}" ${x.taken ? "disabled" : ""}><span>${x.t}</span></label>`).join("") : `<span class="muted small">${t("no_slots")}</span>`;
}
function ics(a) {
  const f = n => String(n).padStart(2, "0"), [y, m, d] = a.date.split("-").map(Number), [hh, mm] = a.slot.split(":").map(Number), e = new Date(y, m - 1, d, hh, mm + 30);
  const fmt = (Y, M, D, H, N) => `${Y}${f(M)}${f(D)}T${f(H)}${f(N)}00`, st = fmt(y, m, d, hh, mm);
  download("caresync-appointment.ics", ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CareSync//EN", "BEGIN:VEVENT", `UID:${a.id}@caresync`, `DTSTAMP:${st}`, `DTSTART:${st}`, `DTEND:${fmt(e.getFullYear(), e.getMonth() + 1, e.getDate(), e.getHours(), e.getMinutes())}`, `SUMMARY:Appointment with ${a.doctorName}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n"), "text/calendar");
}
const initials = n => n.replace("Dr. ", "").split(" ").map(w => w[0]).slice(0, 2).join("");

// ---------- patient views ----------
function homeView() {
  const next = S.appts.filter(a => a.status === "booked").sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot))[0];
  const qa = (v, i, h, s) => `<button class="card qa" data-act="go" data-v="${v}"><span class="ico">${ic(i)}</span><h3>${t(h)}</h3><p>${t(s)}</p></button>`;
  const u = S.user, keys = [...PROFILE_KEYS, "conditions"], pct = Math.round(100 * keys.filter(k => Array.isArray(u[k]) ? u[k].length : u[k] !== undefined && u[k] !== "").length / keys.length);
  return `<h2>${t("hello", { n: esc(u.name.split(" ")[0]) })}</h2><p class="sub">${t("home_sub")}</p>
  <div class="grid">${qa("find", "search", "qa_book", "qa_book_s")}${qa("chat", "chat", "qa_chat", "qa_chat_s")}${qa("profile", "file", "qa_prof", "qa_prof_s")}</div>
  <div class="tiles" style="grid-template-columns:1fr 1fr;max-width:520px"><div class="tile lvl-soon"><b>${S.appts.filter(a => a.status === "booked").length}</b>${t("t_upcoming")}</div><div class="tile lvl-routine"><b>${S.appts.filter(a => a.status === "done").length}</b>${t("t_visits")}</div></div>
  <h3 style="margin:8px 0 12px">${t("next_appt")}</h3>${next ? tag(next, false) : `<p class="muted">${t("none_appt")}</p>`}
  ${pct < 100 ? `<div class="card" style="margin-top:18px;max-width:520px"><b>${t("prof_pct", { n: pct })}</b><div class="bar"><i style="width:${pct}%"></i></div><button class="btn ghost sm" data-act="go" data-v="profile">${t("nav_profile")}</button></div>` : ""}
  <h3 style="margin:28px 0 4px">${t("how_title")}</h3><div class="how"><div><b>1</b><p>${t("how1")}</p></div><div><b>2</b><p>${t("how2")}</p></div><div><b>3</b><p>${t("how3")}</p></div></div>`;
}
function gridHTML() {
  const l = S.doctors.filter(d => (!S.q || d.name.toLowerCase().includes(S.q.toLowerCase())) && (!S.fs || d.spec === S.fs) && (!S.fc || d.city === S.fc));
  return l.length ? l.map(d => `<div class="card"><div class="dhead"><span class="avatar">${esc(initials(d.name))}</span><div><h3>${esc(d.name)}</h3><span class="muted small">${esc(specName(d.spec))}</span></div></div>
   <p class="small muted">${esc(d.city)} · ${t("yrs", { n: d.exp })}<br>${esc(d.langs)}</p><p><b>₹${d.fee}</b></p><button class="btn sm" data-act="book" data-id="${d.id}">${t("book")}</button></div>`).join("") : `<p class="muted">${t("no_docs")}</p>`;
}
function findView() {
  const cities = [...new Set(S.doctors.map(d => d.city))];
  return `<h2>${t("nav_find")}</h2><div class="filters"><input id="q" value="${esc(S.q)}" placeholder="${t("search_ph")}">
  <select data-f="fs"><option value="">${t("all_spec")}</option>${SPECS.map(s => `<option value="${s}" ${S.fs === s ? "selected" : ""}>${specName(s)}</option>`).join("")}</select>
  <select data-f="fc"><option value="">${t("all_city")}</option>${cities.map(c => `<option ${S.fc === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div><div class="grid" id="grid">${gridHTML()}</div>`;
}
const SYMS = ["fever", "cough", "headache", "nausea", "diarrhea", "dizzy", "fatigue", "rash", "throat", "bodyache", "appetite", "weightloss", "urine", "swelling", "palpitations"];
const SCR = ["chest", "breath", "faint", "stroke", "bleed", "seizure", "confusion", "bloodvomit"];
const CONDS = ["diabetes", "bp", "asthma", "heart", "thyroid", "kidney", "epilepsy", "cancer", "tb"];
const BODY = ["head", "chest", "abdomen", "back", "limbs", "skin", "general", "other"];
const SEX = [["F", "female"], ["M", "male"], ["O", "other"]], HABIT = [["no", "o_no"], ["sometimes", "o_some"], ["daily", "o_daily"]];
const PROFILE_KEYS = ["age", "sex", "height", "weight", "blood", "allergies", "meds", "history", "surgeries", "family", "smoking", "alcohol", "ec_name", "ec_phone"];
const fld = (n, k, d, type = "text", x = "") => `<label><span>${t(k)}</span><input type="${type}" name="${n}" value="${esc(d[n] ?? "")}" ${x}></label>`;
const sel = (n, k, opts, d) => `<label><span>${t(k)}</span><select name="${n}">${opts.map(([v, l]) => `<option value="${v}" ${(d[n] ?? opts[0][0]) === v ? "selected" : ""}>${t(l)}</option>`).join("")}</select></label>`;
const cbs = (pre, ids, kp, d) => `<div class="cbs">${ids.map(i => `<label class="cb"><input type="checkbox" name="${pre}_${i}" ${d[pre + "_" + i] ? "checked" : ""}><span>${t(kp + i)}</span></label>`).join("")}</div>`;
const sec = (title, body, cls = "") => `<fieldset class="sec ${cls}"><legend>${t(title)}</legend>${body}</fieldset>`;
const aboutYou = d => `<div class="row">${fld("age", "age", d, "number", 'min="0" max="120"')}${sel("sex", "sex", SEX, d)}${fld("blood", "blood", d)}</div><div class="row">${fld("height", "height", d, "number")}${fld("weight", "weight", d, "number")}<span></span></div>`;
const background = d => `<div class="row2">${fld("allergies", "allergies", d)}${fld("meds", "meds", d)}</div><div><span class="lbl">${t("conditions")}</span>${cbs("cond", CONDS, "cd_", d)}</div>
  <div class="row2">${fld("surgeries", "surgeries", d)}${fld("history", "history", d)}</div>${fld("family", "family", d)}<div class="row2">${sel("smoking", "smoking", HABIT, d)}${sel("alcohol", "alcohol", HABIT, d)}</div>
  <div class="row2">${fld("ec_name", "ec_name", d)}${fld("ec_phone", "ec_phone", d, "tel")}</div>`;
const pickKeys = (d, pre) => Object.keys(d).filter(k => k.startsWith(pre + "_") && d[k]).map(k => k.slice(pre.length + 1));

function openBook(id, demoIdx) {
  S.book = S.doctors.find(d => d.id === id); S.result = null; S.step = 0; const u = S.user;
  S.draft = { date: new Date(Date.now() + 864e5).toISOString().slice(0, 10), severity: 5, body: "general", onset: "gradual", course: "same", visit_type: "first", smoking: "no", alcohol: "no", sex: "F" };
  PROFILE_KEYS.forEach(k => { if (u[k] !== undefined && u[k] !== "") S.draft[k] = u[k]; });
  (u.conditions || []).forEach(c => S.draft["cond_" + c] = true);
  if (demoIdx != null) { Object.keys(S.draft).filter(k => /^(cond|sym|scr)_/.test(k)).forEach(k => delete S.draft[k]); Object.assign(S.draft, DEMOS[demoIdx].d); }
  S.view = "book"; render(); window.scrollTo(0, 0);
}
function bookView() {
  const d = S.draft, b = S.book, st = (n, html) => `<div class="step ${S.step === n ? "on" : ""}">${html}</div>`;
  if (S.result) return `<h2>${t("booked")}</h2>${tag(S.result, false)}<button class="btn" data-act="go" data-v="appts">${t("view_appts")}</button>`;
  return `<div class="dhead"><span class="avatar">${esc(initials(b.name))}</span><div><h2 style="margin:0">${esc(b.name)}</h2><span class="muted">${esc(specName(b.spec))} · ${esc(b.city)} · ₹${b.fee}</span></div></div>
  <p class="muted small" style="margin:14px 0 6px">${t("quickfill")}</p>${[1, 2, 3].map(i => `<button class="chip" data-act="demofill" data-v="${i - 1}">${t("q" + i)}</button>`).join("")}
  <div class="prog" style="margin-top:12px">${[0, 1, 2, 3].map(i => `<i class="${i <= S.step ? "on" : ""}"></i>`).join("")}</div><p class="muted small" style="margin:0">${t("step_n", { a: S.step + 1, b: 4 })}</p>
  <form class="form" data-form="book" style="margin-top:12px">
  ${st(0, sec("sec_visit", `<div class="row12"><label><span>${t("date")}</span><input type="date" name="date" value="${d.date}" min="${new Date().toISOString().slice(0, 10)}" required></label>
    <div><span class="lbl">${t("slot")}</span><div class="slots" id="slots"></div></div></div>${sel("visit_type", "visit_type", [["first", "vt_first"], ["follow", "vt_follow"]], d)}`))}
  ${st(1, sec("sec_problem", `<label><span>${t("symptoms")}</span><textarea name="symptoms" id="symptoms" rows="4" required placeholder="${t("symptoms_ph")}">${esc(d.symptoms || "")}</textarea></label>
    <div><button type="button" class="chip" data-act="mic" data-t="symptoms">🎤 ${t("speak")}</button></div>
    <div class="row">${sel("body", "body_area", BODY.map(x => [x, "b_" + x]), d)}${sel("onset", "onset", [["gradual", "on_gradual"], ["sudden", "on_sudden"]], d)}${sel("course", "course", [["same", "c_same"], ["worse", "c_worse"], ["better", "c_better"]], d)}</div>
    <div class="row">${fld("duration", "duration", d)}<label><span>${t("severity")}</span><input type="range" name="severity" min="1" max="10" value="${d.severity}"><output>${d.severity}</output></label><span></span></div>
    ${fld("modifiers", "modifiers", d)}${fld("tried", "tried", d)}`) + sec("sec_screen", `<p class="muted small" style="margin:0">${t("screen_note")}</p>${cbs("scr", SCR, "sc_", d)}`, "warn"))}
  ${st(2, sec("sec_symptoms", cbs("sym", SYMS, "sy_", d)) + sec("sec_vitals", `<div class="row5">${fld("temp", "temp", d, "number", 'step="0.1"')}${fld("bp_sys", "bp_sys", d, "number")}${fld("bp_dia", "bp_dia", d, "number")}${fld("pulse", "pulse", d, "number")}${fld("spo2", "spo2", d, "number")}</div>`))}
  ${st(3, sec("sec_you", `${aboutYou(d)}<label class="check"><input type="checkbox" name="pregnant" ${d.pregnant ? "checked" : ""}><span>${t("pregnant")}</span></label><div class="row2">${fld("preg_weeks", "preg_weeks", d, "number")}${fld("preg_issues", "preg_issues", d)}</div>`) + sec("sec_back", background(d)) +
    `<label><span>${t("notes")}</span><textarea name="notes" rows="3">${esc(d.notes || "")}</textarea></label><label class="check"><input type="checkbox" required><span>${t("consent")}</span></label>`)}
  <div class="nav2">${S.step > 0 ? `<button type="button" class="btn ghost" data-act="prev">${t("prev")}</button>` : "<span></span>"}${S.step < 3 ? `<button type="button" class="btn" data-act="next">${t("next")}</button>` : `<button class="btn" id="go">${t("check_book")}</button>`}</div></form>`;
}
async function loadSlots() {
  const el = $("#slots"); if (!el || !S.book) return;
  const list = await db.slots(S.book.id, S.draft.date).catch(() => []);
  el.innerHTML = list.length ? list.map(x => `<label class="slot"><input type="radio" name="slot" value="${x.t}" required ${x.taken ? "disabled" : ""} ${S.draft.slot === x.t ? "checked" : ""}><span>${x.t}</span></label>`).join("") : `<span class="muted small">${t("no_slots")}</span>`;
}
async function submitBook(f) {
  const d = S.draft, btn = $("#go") || {}; btn.disabled = true; btn.textContent = t("working");
  const intake = { symptoms: d.symptoms, duration: d.duration || "", severity: +d.severity || 5, age: d.age ? +d.age : null, sex: d.sex || "", pregnant: !!d.pregnant, allergies: d.allergies || "", medications: d.meds || "", history: d.history || "",
    visit_type: d.visit_type, body: d.body, onset: d.onset, course: d.course, modifiers: d.modifiers || "", tried: d.tried || "", symptom_list: pickKeys(d, "sym"), screen: pickKeys(d, "scr"), conditions: pickKeys(d, "cond"),
    temp: d.temp || "", bp_sys: d.bp_sys || "", bp_dia: d.bp_dia || "", pulse: d.pulse || "", spo2: d.spo2 || "", height: d.height || "", weight: d.weight || "", blood: d.blood || "", preg_weeks: d.preg_weeks || "", preg_issues: d.preg_issues || "",
    surgeries: d.surgeries || "", family: d.family || "", smoking: d.smoking, alcohol: d.alcohol, ec_name: d.ec_name || "", ec_phone: d.ec_phone || "", notes: d.notes || "" };
  try {
    const r = await api("/api/triage", { intake, lang: S.lang }); db.log({ level: r.level, reasons: r.reasons, lang: S.lang, at: Date.now() });
    if (r.level === "emergency") { S.emergency = r; return render(); }
    S.result = await db.addAppt({ patientId: S.user.uid, patientName: S.user.name, doctorId: S.book.id, doctorName: S.book.name, spec: S.book.spec, date: d.date, slot: d.slot, status: "booked", intake, level: r.level, reasons: r.reasons, report: r.report, message: r.message, ai_used: r.ai_used, lang: S.lang, consent_at: Date.now(), at: Date.now() });
    await refresh(); render();
  } catch (e) { toast(e.message === "409" ? t("slot_taken") : "Cannot reach the CareSync server (uvicorn main:app --port 8000)"); if (e.message === "409") loadSlots(); btn.disabled = false; btn.textContent = t("check_book"); }
}
const sortA = l => [...l].sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
function apptsView() {
  const up = S.appts.filter(x => x.status === "booked"), past = S.appts.filter(x => x.status !== "booked"), isPast = S.atab === "past";
  const list = isPast ? sortA(past).reverse() : sortA(up);
  return `<h2>${t("nav_appts")}</h2><div class="tabs"><button class="${isPast ? "" : "on"}" data-act="aptab" data-v="up">${t("upcoming")} (${up.length})</button><button class="${isPast ? "on" : ""}" data-act="aptab" data-v="past">${t("past")} (${past.length})</button></div>
  ${list.length ? list.map(x => tag(x, false)).join("") : `<p class="muted">${t("none_appt")}</p>`}`;
}
function recordsView() {
  const done = sortA(S.appts.filter(x => x.status === "done")).reverse(), pres = done.filter(x => x.consult?.prescription).slice(0, 3);
  return `<h2>${t("nav_records")}</h2>${pres.length ? `<h3 style="margin:6px 0 10px">${t("presc_active")}</h3>${pres.map(x => `<div class="card" style="margin-bottom:10px"><b>${esc(x.doctorName)}</b> · ${esc(x.date)}<p style="margin:6px 0 0">${esc(x.consult.prescription)}</p>${x.consult.followup ? `<p class="small muted" style="margin:4px 0 0">${t("followup")}: ${esc(x.consult.followup)}</p>` : ""}</div>`).join("")}` : ""}
  <h3 style="margin:18px 0 10px">${t("visit_history")}</h3>${done.length ? done.map(x => tag(x, false)).join("") : `<p class="muted">${t("none_records")}</p>`}`;
}
function profileView() {
  const u = S.user, dr = u.role === "doctor", doc = dr ? S.doctors.find(d => d.id === u.doctorId) || {} : {};
  const d = { ...u, ...Object.fromEntries((u.conditions || []).map(c => ["cond_" + c, true])) };
  const dd = Object.fromEntries((doc.days ?? [0, 1, 2, 3, 4, 5]).map(i => ["day_" + i, true])), dv = { start: doc.start ?? "10:00", end: doc.end ?? "16:30", slot_min: String(doc.slot_min ?? 30) };
  return `<h2>${dr ? t("nav_dprofile") : t("nav_profile")}</h2><p class="sub">${dr ? "" : t("profile_sub")}</p><form class="form" data-form="profile">
  <label><span>${t("fullname")}</span><input name="name" value="${esc(u.name)}" required></label>
  ${dr ? `<label><span>${t("spec")}</span><select name="spec">${SPECS.map(s => `<option value="${s}" ${doc.spec === s ? "selected" : ""}>${specName(s)}</option>`).join("")}</select></label>
   <div class="row"><label><span>${t("city")}</span><input name="city" value="${esc(doc.city)}"></label><label><span>${t("fee")}</span><input type="number" name="fee" value="${doc.fee ?? ""}"></label><label><span>${t("exp")}</span><input type="number" name="exp" value="${doc.exp ?? ""}"></label></div>
   <label><span>${t("langs_spoken")}</span><input name="langs" value="${esc(doc.langs)}"></label>
   ${sec("days", cbs("day", [0, 1, 2, 3, 4, 5, 6], "wd_", dd) + `<div class="row">${fld("start", "start", dv, "time")}${fld("end", "end", dv, "time")}${sel("slot_min", "slot_min", [["15", "15"], ["20", "20"], ["30", "30"], ["45", "45"], ["60", "60"]], dv)}</div>`)}`
  : `${sec("sec_you", aboutYou(d))}${sec("sec_back", background(d))}`}
  <div><button class="btn">${t("save")}</button></div></form>
  <div class="card" style="max-width:820px;margin-top:20px"><h3 style="margin-bottom:10px">${t("privacy")}</h3><button class="btn ghost sm" data-act="export">${t("export")}</button> <button class="btn red sm" data-act="delmine">${t("delete_acct")}</button></div>`;
}
async function saveProfile(f) {
  const d = Object.fromEntries(new FormData(f)), u = S.user;
  if (u.role === "doctor") {
    await db.saveDoctor(u.doctorId, { name: d.name, spec: d.spec, city: d.city, fee: +d.fee, exp: +d.exp, langs: d.langs, days: pickKeys(d, "day").map(Number), start: d.start, end: d.end, slot_min: +d.slot_min });
    await db.saveProfile(u.uid, { name: d.name }); S.doctors = await db.doctors(); S.user = { ...u, name: d.name };
  } else {
    const patch = { name: d.name, conditions: pickKeys(d, "cond") }; PROFILE_KEYS.forEach(k => patch[k] = d[k] ?? ""); patch.age = d.age ? +d.age : "";
    await db.saveProfile(u.uid, patch); S.user = { ...u, ...patch };
  }
  toast(t("saved")); render();
}
async function saveConsult(f) {
  const d = Object.fromEntries(new FormData(f)); toast(t("saving"));
  try { await db.updateAppt(f.dataset.id, { status: "done", consult: { diagnosis: d.diagnosis, advice: d.advice, prescription: d.prescription, followup: d.followup } }); S.consult = null; await refresh(); render(); }
  catch { toast("Could not save the visit"); }
}

// ---------- chat ----------
const chatMsgs = () => `<div class="m b">${t("chat_hi")}</div>` + S.chat.map(m => `<div class="m ${m.role === "user" ? "u" : m.em ? "em" : "b"}">${esc(m.content)}</div>`).join("") + (S.typing ? `<div class="m b">…</div>` : "");
function chatView() {
  return `<h2>${t("nav_chat")}</h2><p class="sub"></p>${S.chat.length ? "" : [1, 2, 3].map(i => `<button class="chip" data-act="ask" data-v="${t("s" + i)}">${t("s" + i)}</button>`).join("")}
  <div class="card chatbox"><div class="msgs" id="msgs">${chatMsgs()}</div><form class="cf" data-form="chat"><button type="button" class="chip" style="margin:0" data-act="mic" data-t="cin">🎤</button>
  <input id="cin" placeholder="${t("chat_ph")}" autocomplete="off"><button class="btn">${t("send")}</button></form></div>`;
}
async function ask(txt) {
  txt = (txt || "").trim(); if (!txt) return;
  S.chat.push({ role: "user", content: txt }); S.typing = true; drawChat();
  try { const r = await api("/api/chat", { messages: S.chat.map(({ role, content }) => ({ role, content })), lang: S.lang }); S.chat.push({ role: "assistant", content: r.reply, em: r.emergency }); }
  catch { S.chat.push({ role: "assistant", content: "Server not reachable. For emergencies call 112.", em: true }); }
  S.typing = false; if (S.view === "chat") drawChat(); else render();
}
function drawChat() { const m = $("#msgs"); if (!m) return render(); m.innerHTML = chatMsgs(); m.scrollTop = m.scrollHeight; }

// ---------- doctor queue ----------
function queueView() {
  if (S.user.doctorStatus !== "approved") return `<h2>${t("pending_title")}</h2><p>${t("pending_body")}</p>`;
  const l = S.appts.filter(a => a.status !== "cancelled"), wait = l.filter(a => a.status === "booked"), seen = l.filter(a => a.status === "done");
  const shown = (S.qtab === "pending" ? wait : seen).sort((a, b) => RANK[b.level] - RANK[a.level] || (a.date + a.slot).localeCompare(b.date + b.slot));
  return `<h2>${t("nav_queue")}</h2><div class="tiles">${["emergency", "urgent", "soon", "routine"].map(k => `<div class="tile lvl-${k}"><b>${wait.filter(a => a.level === k).length}</b>${t("lvl_" + k)}</div>`).join("")}</div>
  <div class="tabs"><button class="${S.qtab === "pending" ? "on" : ""}" data-act="qtab" data-v="pending">${t("waiting")} (${wait.length})</button><button class="${S.qtab === "seen" ? "on" : ""}" data-act="qtab" data-v="seen">${t("seen")} (${seen.length})</button></div>
  ${shown.length ? shown.map(a => tag(a, true)).join("") : `<p class="muted">${t("empty_queue")}</p>`}`;
}
function adminView() {
  const a = S.admin; if (!a) return `<h2>${t("nav_overview")}</h2>`;
  const tile = (n, k, c) => `<div class="tile lvl-${c}"><b>${n}</b>${t(k)}</div>`;
  return `<h2>${t("nav_overview")}</h2><div class="tiles">${tile(a.users, "st_users", "routine")}${tile(a.appts, "st_appts", "soon")}${tile(a.emergencies, "st_emerg", "emergency")}${tile(a.accuracy == null ? "–" : a.accuracy + "%", "st_ai", "urgent")}</div>
  <p class="muted small">${t("st_rules")}: ${a.rules_only}</p><h3 style="margin:22px 0 10px">${t("audit")}</h3><div class="card small">${a.audit.map(x => `<div>${new Date(x.at * 1000).toLocaleString()} · ${esc(String(x.who).slice(0, 6))} · ${esc(x.act)} ${esc(x.detail || "")}</div>`).join("") || "–"}</div>`;
}
function adoctorsView() {
  const a = S.admin; if (!a) return `<h2>${t("adm_doctors")}</h2>`;
  return `<h2>${t("adm_doctors")}</h2>${a.doctors.map(d => `<div class="card" style="margin-bottom:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="flex:1"><b>${esc(d.name)}</b> · ${esc(specName(d.spec))}<br><span class="muted small">${esc(d.city)} · ${esc(d.reg_no || "")} · ${esc(d.status || "approved")}</span></div>
   ${d.status === "approved" ? "" : `<button class="btn sm" data-act="setdoc" data-id="${d.id}" data-v="approved">${t("approve")}</button>`}${d.status === "rejected" ? "" : `<button class="btn ghost sm" data-act="setdoc" data-id="${d.id}" data-v="rejected">${t("reject")}</button>`}</div>`).join("")}`;
}
function usersTable() {
  const q = (S.uq || "").toLowerCase(), l = (S.ausers || []).filter(u => !q || (u.name + u.email).toLowerCase().includes(q));
  return `<div class="tw"><table class="tbl"><tr><th>${t("name_c")}</th><th>${t("email_c")}</th><th>${t("role")}</th><th>${t("visits_c")}</th><th>${t("status_c")}</th><th></th></tr>${l.map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${u.appts}</td><td>${u.disabled ? t("suspended") : t("active")}</td>
   <td>${u.role === "admin" ? "" : `<button class="btn ${u.disabled ? "" : "ghost "}sm" data-act="usr" data-id="${u.uid}" data-v="${u.disabled ? 0 : 1}">${u.disabled ? t("restore") : t("suspend")}</button>`}</td></tr>`).join("")}</table></div>`;
}
function ausersView() { return `<h2>${t("nav_users")}</h2><div style="max-width:380px;margin-bottom:14px"><input id="uq" value="${esc(S.uq || "")}" placeholder="${t("search_users")}"></div><div id="utbl">${usersTable()}</div>`; }
function apptsTable() {
  const l = (S.aappts || []).filter(x => !S.afs || x.status === S.afs);
  return `<div class="tw"><table class="tbl"><tr><th>${t("when_c")}</th><th>${t("patient_c")}</th><th>${t("doctor_c")}</th><th>${t("level_c")}</th><th>${t("status_c")}</th></tr>${l.map(x => `<tr><td>${esc(x.date)} ${esc(x.slot)}</td><td>${esc(x.patientName)}</td><td>${esc(x.doctorName)}</td><td><span class="pill lvl-${esc(x.level)}">${t("lvl_" + x.level)}</span></td><td>${esc(x.status)}</td></tr>`).join("")}</table></div>`;
}
function aapptsView() {
  return `<h2>${t("nav_allappts")}</h2><div style="max-width:240px;margin-bottom:14px"><select data-f="afs">${[["", "all"], ["booked", "upcoming"], ["done", "seen"], ["cancelled", "cancelled"]].map(([v, k]) => `<option value="${v}" ${S.afs === v ? "selected" : ""}>${t(k)}</option>`).join("")}</select></div><div id="atbl">${apptsTable()}</div>`;
}
function asysView() {
  const s = S.asys, row = (k, on) => `<div class="srow"><span>${t(k)}</span><span class="pill lvl-${on ? "routine" : "soon"}">${t(on ? "on" : "off")}</span></div>`;
  return `<h2>${t("nav_system")}</h2><p class="sub">${t("sys_hint")}</p>${s ? `<div class="card" style="max-width:560px">${row("sys_ai", s.ai_key_set)}${row("sys_email", s.email_enabled)}${row("sys_google", s.google_enabled)}</div>` : ""}
  <p><button class="btn" data-act="testai">${t("test_ai")}</button></p>${S.health ? `<pre class="card small" style="max-width:560px;white-space:pre-wrap">${esc(JSON.stringify(S.health, null, 2))}</pre>` : ""}`;
}
function mic(target) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return toast("Voice input needs Chrome or Edge");
  const r = new SR(); r.lang = S.lang + "-IN"; r.onresult = e => { const el = document.getElementById(target); el.value = (el.value + " " + e.results[0][0].transcript).trim(); el.dispatchEvent(new Event("input", { bubbles: true })); }; r.start(); toast("🎤 …");
}

// ---------- Google sign-in (only shown when GOOGLE_CLIENT_ID is set on the server) ----------
function initGoogle() {
  const el = $("#gbtn"); if (!S.gid || !el || !window.google) return;
  google.accounts.id.initialize({ client_id: S.gid, callback: async r => {
    const f = document.querySelector("[data-form=auth]"), v = n => f?.elements[n]?.value;
    const profile = S.authTab === "signup" && S.role === "doctor" ? { role: "doctor", name: v("name"), spec: v("spec"), city: v("city"), fee: +v("fee") || 500, langs: v("langs"), reg_no: v("reg_no") } : S.authTab === "signup" && v("name") ? { name: v("name") } : {};
    try { await db.google(r.credential, profile); } catch { toast(t("auth_err")); } } });
  google.accounts.id.renderButton(el, { theme: "outline", size: "large", width: 340, text: S.authTab === "signup" ? "signup_with" : "signin_with", locale: S.lang });
}
addEventListener("gsi", () => { if (!S.user) render(); });

// ---------- data + events ----------
async function refresh() {
  try { S.appts = !S.user || S.user.role === "admin" ? [] : await db.appts(S.user.role === "doctor" ? { doctorId: S.user.doctorId } : { patientId: S.user.uid }); } catch { S.appts = []; }
}
function render() { root.innerHTML = S.user ? shell() : authView(); if (!S.user) initGoogle(); if (S.user && S.resched) loadRSlots(); if (S.user && S.view === "book" && !S.result) loadSlots(); const m = $("#msgs"); if (m) m.scrollTop = m.scrollHeight; }
async function go(v) { S.view = v; if (["home", "appts", "queue", "records"].includes(v)) await refresh();
  if (v === "admin" || v === "adoctors") S.admin = await db.adminOverview().catch(() => null);
  if (v === "ausers") S.ausers = await db.adminUsers().catch(() => []); if (v === "aappts") S.aappts = await db.adminAppts().catch(() => []); if (v === "asys") { S.asys = await db.adminSystem().catch(() => null); S.health = null; } render(); window.scrollTo(0, 0); }

const acts = {
  atab: a => { S.authTab = a.dataset.v; render(); }, role: a => { S.role = a.dataset.v; render(); },
  demo: a => db.demo(a.dataset.v).catch(() => toast(t("auth_err"))), go: a => go(a.dataset.v), out: () => db.signOut(),
  sos: () => { S.emergency = { message: "" }; render(); }, closeem: () => { S.emergency = null; render(); },
  book: a => openBook(a.dataset.id), demofill: a => openBook(DEMOS[a.dataset.v].doc, +a.dataset.v), mic: a => mic(a.dataset.t),
  cancel: async a => { await db.updateAppt(a.dataset.id, { status: "cancelled" }); await refresh(); render(); },
  seen: async a => { await db.updateAppt(a.dataset.id, { status: "done" }); await refresh(); render(); },
  qtab: a => { S.qtab = a.dataset.v; render(); }, ask: a => ask(a.dataset.v),
  next: () => {
    if (S.step === 0 && !S.draft.slot) return toast(t("pick_slot"));
    if (![...document.querySelectorAll(".step.on input, .step.on select, .step.on textarea")].every(x => x.reportValidity())) return;
    if (S.step === 1 && pickKeys(S.draft, "scr").length) return submitBook($("form[data-form=book]"));   // danger sign ticked: stop and triage now
    S.step++; render(); window.scrollTo(0, 0);
  }, prev: () => { S.step--; render(); window.scrollTo(0, 0); },
  aptab: a => { S.atab = a.dataset.v; render(); },
  usr: async a => { await db.adminUser(a.dataset.id, a.dataset.v === "1"); S.ausers = await db.adminUsers(); render(); },
  testai: async () => { S.health = { checking: "…" }; render(); S.health = await fetch("/api/health").then(r => r.json()).catch(() => ({ error: "server unreachable" })); render(); },
  resched: a => { S.resched = a.dataset.id; S.rdate = new Date(Date.now() + 864e5).toISOString().slice(0, 10); render(); },
  rclose: () => { S.resched = null; render(); },
  rsave: async a => {
    const sl = document.querySelector('input[name="rslot"]:checked'); if (!sl) return toast(t("pick_slot"));
    try { await db.updateAppt(a.dataset.id, { date: S.rdate, slot: sl.value }); S.resched = null; await refresh(); render(); toast(t("rescheduled")); }
    catch (e) { toast(e.message === "409" ? t("slot_taken") : "Could not reschedule"); loadRSlots(); }
  },
  consult: a => { S.consult = a.dataset.id; render(); }, fb: async a => { await db.updateAppt(a.dataset.id, { feedback: a.dataset.v }); await refresh(); render(); },
  ics: a => ics(S.appts.find(x => x.id === a.dataset.id)), export: async () => download("caresync-my-data.json", JSON.stringify(await db.exportMe(), null, 2), "application/json"),
  delmine: async () => { if (confirm(t("delete_confirm"))) await db.deleteMe(); }, setdoc: async a => { await db.adminDoctor(a.dataset.id, a.dataset.v); S.admin = await db.adminOverview(); render(); }
};
root.onclick = e => { const a = e.target.closest("[data-act]"); if (a) acts[a.dataset.act]?.(a); };
root.onsubmit = async e => {
  e.preventDefault(); const f = e.target, k = f.dataset.form;
  if (k === "auth") {
    const d = Object.fromEntries(new FormData(f));
    try { if (S.authTab === "signin") await db.signIn(d.email, d.password); else await db.signUp(d.email, d.password, S.role === "doctor" ? { role: "doctor", name: d.name, spec: d.spec, city: d.city, fee: +d.fee || 500, langs: d.langs, reg_no: d.reg_no, exp: 5 } : { role: "patient", name: d.name }); }
    catch { toast(t("auth_err")); }
  } else if (k === "book") { S.step < 3 ? acts.next() : submitBook(f); } else if (k === "profile") saveProfile(f);
  else if (k === "consult") saveConsult(f); else if (k === "chat") { const i = $("#cin"), v = i.value; i.value = ""; ask(v); }
};
root.oninput = e => {
  const n = e.target;
  if (n.id === "rdate") { S.rdate = n.value; loadRSlots(); }
  if (n.id === "uq") { S.uq = n.value; $("#utbl").innerHTML = usersTable(); }
  if (n.id === "q") { S.q = n.value; $("#grid").innerHTML = gridHTML(); }
  if (n.form?.dataset.form === "book" && n.name) {
    S.draft[n.name] = n.type === "checkbox" ? n.checked : n.value;
    if (n.name === "date") { S.draft.slot = ""; loadSlots(); } if (n.name === "severity") n.nextElementSibling.textContent = n.value;
  }
};
root.onchange = e => {
  const n = e.target;
  if (n.dataset.lang !== undefined) setLang(n.value);
  else if (n.dataset.f) { S[n.dataset.f] = n.value; if ($("#grid")) $("#grid").innerHTML = gridHTML(); else if ($("#atbl")) $("#atbl").innerHTML = apptsTable(); else render(); }
};

await setLang(S.lang);
S.gid = (await db.config().catch(() => ({}))).googleClientId || "";
await db.init(async u => {
  S.user = u; if (u) { S.doctors = await db.doctors(); await refresh(); S.view = u.role === "admin" ? "admin" : u.role === "doctor" ? "queue" : "home"; S.emergency = null; S.chat = []; if (u.role === "admin") S.admin = await db.adminOverview().catch(() => null); }
  render(); window.scrollTo(0, 0);
});