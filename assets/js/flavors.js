import { $, $$ } from "./util.js";
/** Library filters (type + profile + search, URL-synced) and the two-question flavor matchmaker. */
export function init() {
  const cards = $$(".flavor"), q = $("#flavor-search"), count = $("[data-count]"), empty = $("[data-empty]");
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "all"; let prof = params.get("profile") || "";
  const run = () => {
    const terms = (q.value || "").toLowerCase().trim().split(/\s+/).filter(Boolean); let n = 0;
    for (const c of cards) { const ok = (type === "all" || c.dataset.type === type) && (!prof || c.dataset.profile === prof) && terms.every((t) => c.dataset.search.includes(t)); c.hidden = !ok; if (ok) n++; }
    $$("[data-type-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.typeFilter === type)));
    $$("[data-profile-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.profileFilter === prof)));
    count.textContent = `${n} flavor${n === 1 ? "" : "s"}`; empty.hidden = n > 0;
    const u = new URL(location); type === "all" ? u.searchParams.delete("type") : u.searchParams.set("type", type); prof ? u.searchParams.set("profile", prof) : u.searchParams.delete("profile"); history.replaceState(null, "", u);
  };
  $$("[data-type-filter]").forEach((b) => b.addEventListener("click", () => { type = b.dataset.typeFilter; run(); }));
  $$("[data-profile-filter]").forEach((b) => b.addEventListener("click", () => { prof = prof === b.dataset.profileFilter ? "" : b.dataset.profileFilter; run(); }));
  q.addEventListener("input", run); run();

  const form = $("[data-matcher]"), out = $("[data-match-result]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault(); let bad = false;
    for (const n of ["mood", "base"]) { const v = form.elements[n].value; const err = form.querySelector(`[data-error-for=${n}]`); err.hidden = !!v; err.textContent = v ? "" : "Pick one."; if (!v) bad = true; }
    if (bad) return;
    const mood = form.elements.mood.value, base = form.elements.base.value;
    let pool = cards.filter((c) => c.dataset.profile === mood && (base === "any" || c.dataset.type === base));
    if (!pool.length) pool = cards.filter((c) => base === "any" || c.dataset.type === base);
    // deterministic pick that still varies: newest-seen first, then by name
    const pick = pool[0], alt = pool.slice(1, 3);
    const name = (c) => c.querySelector("h3").textContent;
    out.hidden = false;
    out.innerHTML = `<p class="eyebrow">Ask for…</p><p class="h3">${name(pick)}</p>
<p>${alt.length ? `Or try ${alt.map(name).join(" or ")}. ` : ""}It’s from the library, so it may not be in the case today. Check Instagram, or ask the counter what’s closest.</p>
<div class="actions"><a class="btn btn--ghost btn--small" href="?profile=${encodeURIComponent(mood)}${base !== "any" ? "&type=" + encodeURIComponent(base) : ""}#library">See all ${pool.length} matches</a></div>`;
    out.querySelector(".h3").setAttribute("tabindex", "-1"); out.querySelector(".h3").focus();
  });
}
