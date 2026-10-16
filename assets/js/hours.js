import { $$, zonedParts, rootRel } from "./util.js";
/** Live open/closed status in Austin time (America/Chicago) from /data/settings.json, with a static fallback in the HTML. */
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
const toMin = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
const t12 = (hm) => { let [h, m] = hm.split(":").map(Number); const s = h < 12 ? "am" : "pm"; h = h % 12 || 12; return `${h}${m ? ":" + String(m).padStart(2, "0") : ""} ${s}`; };
export function statusAt(settings, date = new Date()) {
  const { dow, date: ymd, mins } = zonedParts(date, settings.timezone || "America/Chicago");
  const closure = (settings.closures || []).find((c) => c.date === ymd);
  const today = closure ? null : settings.hours[dow];
  if (today && mins >= toMin(today[0]) && mins < toMin(today[1])) {
    const left = toMin(today[1]) - mins;
    return { open: true, text: left <= 60 ? `Open now · closes in ${left} min` : `Open now · until ${t12(today[1])}`, dow };
  }
  if (today && mins < toMin(today[0])) return { open: false, text: `Closed now · opens today at ${t12(today[0])}`, dow };
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(DAYS.indexOf(dow) + i) % 7]; const h = settings.hours[d];
    if (h) return { open: false, text: `Closed now · opens ${i === 1 ? "tomorrow" : NAMES[d]} at ${t12(h[0])}`, dow };
  }
  return { open: false, text: "Closed", dow };
}
export async function init() {
  let s; try { s = await (await fetch(rootRel("/data/settings.json"), { cache: "no-cache" })).json(); } catch { return; }
  const at = new URLSearchParams(location.search).get("at"); // QA: ?at=2026-10-14T15:00:00-05:00
  const render = () => {
    const st = statusAt(s, at ? new Date(at) : new Date());
    for (const el of $$("[data-open-status]")) { el.classList.toggle("is-open", st.open); el.classList.toggle("is-closed", !st.open); el.querySelector("[data-open-text]").textContent = st.text; }
    for (const el of $$("[data-open-dot]")) { el.closest(".btn")?.classList.toggle("is-open", st.open); }
    for (const tr of $$("[data-hours] tr")) tr.classList.toggle("is-today", tr.dataset.day === st.dow);
    for (const el of $$("[data-open-short]")) el.textContent = st.open ? "Open now" : "Visit the shop";
  };
  render(); if (!at) setInterval(render, 60000);
}
