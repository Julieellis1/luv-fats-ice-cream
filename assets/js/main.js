import { $, $$, store, reduced } from "./util.js";
import { initForms } from "./forms.js";
import { initConsent } from "./consent.js";

// ribbon
const ribbon = $("[data-ribbon]");
if (ribbon) {
  if (document.documentElement.classList.contains("ribbon-hidden")) ribbon.hidden = true;
  $("[data-ribbon-close]", ribbon)?.addEventListener("click", () => { ribbon.hidden = true; try { localStorage.setItem("lf-ribbon", "hidden"); } catch {} });
}
// theme
const tbtn = $("[data-theme-toggle]");
const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
const syncTheme = () => tbtn?.setAttribute("aria-pressed", String(isDark()));
syncTheme();
tbtn?.addEventListener("click", () => { const next = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = next; try { localStorage.setItem("lf-theme", next); } catch {} syncTheme(); });
// nav
const nt = $("[data-nav-toggle]"), nav = $("#site-nav");
if (nt && nav) {
  const set = (open) => { nt.setAttribute("aria-expanded", String(open)); open ? nav.setAttribute("data-open", "") : nav.removeAttribute("data-open"); };
  nt.addEventListener("click", () => set(nt.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nt.getAttribute("aria-expanded") === "true") { set(false); nt.focus(); } });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
}
// reveal-on-scroll (progressive; content visible without JS)
if (!reduced() && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".base-grid > li, .grid-3 > .card, .flavor-grid > li").forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("reveal"); io.observe(el); } });
}
initForms();
initConsent();
// thanks page: tailor message by form
if ($("[data-thanks-title]")) {
  const f = new URLSearchParams(location.search).get("form");
  const copy = { luvletter: ["You’re on the luv letter.", "An occasional email when something new is churning. Unsubscribe any time."],
    pints: ["Pint request sent.", "The shop will reply with flavors and a pickup time. Nothing is charged until pickup."],
    wholesale: ["Wholesale enquiry sent.", "Expect a reply with pricing, minimums and delivery options."],
    event: ["Event request sent.", "The team will check the date and get back to you."] }[f];
  if (copy) { $("[data-thanks-title]").textContent = copy[0]; $("[data-thanks-body]").textContent = copy[1]; }
}
// lazy feature modules
const lazy = [["[data-open-status],[data-hours],[data-open-dot]", "./hours.js"], ["#library", "./flavors.js"], ["[data-tabs]", "./tabs.js"],
  ["form[data-form=pints]", "./pints.js"], ["[data-map]", "./map.js"], ["#faq-list", "./faq.js"]];
const done = new Set();
for (const [sel, mod] of lazy) if ($(sel) && !done.has(mod)) { done.add(mod); import(mod).then((m) => m.init?.()); }
