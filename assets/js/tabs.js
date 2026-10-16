import { $, $$ } from "./util.js";
/** WAI-ARIA tabs (arrow keys, Home/End). #events in the URL opens the Events tab. */
export function init() {
  for (const root of $$("[data-tabs]")) {
    const tabs = $$("[role=tab]", root);
    const select = (t, focus = true) => {
      tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k !== undefined) { e.preventDefault(); select(tabs[(k + tabs.length) % tabs.length]); }
      });
    });
    if (location.hash === "#events") select(tabs[1], false);
    // event headcount hint
    const hc = $("#f-headcount", root), hint = $("[data-lead-hint]", root), d = $("#f-event_date", root);
    const upd = () => {
      if (!d?.value) { hint.hidden = true; return; }
      const days = Math.round((new Date(d.value + "T12:00:00") - Date.now()) / 864e5);
      hint.hidden = days >= 21; hint.textContent = days < 0 ? "That date has passed. Pick a future date." : "Less than three weeks away. Send it anyway; short-notice dates are sometimes possible.";
    };
    d?.addEventListener("change", upd); hc?.addEventListener("input", upd);
  }
}
