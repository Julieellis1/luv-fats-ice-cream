import { $, $$ } from "./util.js";
/** Pint stepper (1–6) and pickup-day check: open days only, from tomorrow (Austin time). */
const DOW = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export function init() {
  const form = $("form[data-form=pints]"); const count = $("#f-count", form); const date = $("#f-pickup_date", form);
  $$(".step-btn", form).forEach((b) => b.addEventListener("click", () => { count.value = Math.max(1, Math.min(6, (+count.value || 1) + +b.dataset.step)); }));
  const tomorrow = new Date(Date.now() + 864e5).toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
  date.min = tomorrow;
  const open = (date.dataset.openDays || "").split(",");
  const err = form.querySelector("[data-error-for=pickup_date]");
  const check = () => {
    if (!date.value) return true;
    const dow = DOW[new Date(date.value + "T12:00:00").getDay()];
    let msg = "";
    if (date.value < tomorrow) msg = "Pick a day from tomorrow on.";
    else if (!open.includes(dow)) msg = "The shop is closed that day. Pick Wednesday to Sunday.";
    err.textContent = msg; err.hidden = !msg; date.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };
  date.addEventListener("change", check);
  form.addEventListener("submit", (e) => { if (!check()) { e.preventDefault(); e.stopImmediatePropagation(); date.focus(); } }, true);
  count.addEventListener("change", () => { count.value = Math.max(1, Math.min(6, Math.round(+count.value || 1))); });
}
