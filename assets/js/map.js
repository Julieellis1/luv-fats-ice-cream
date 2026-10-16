import { $, $$ } from "./util.js";
/** Tap-to-load OpenStreetMap embed: no third-party request until the visitor asks. */
export function init() {
  for (const slot of $$("[data-map]")) {
    $("[data-load-map]", slot)?.addEventListener("click", (e) => {
      const lat = +slot.dataset.lat, lng = +slot.dataset.lng, d = 0.006;
      const f = document.createElement("iframe");
      f.title = `Map: ${slot.dataset.title}`; f.loading = "lazy"; f.referrerPolicy = "no-referrer";
      f.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
      e.currentTarget.replaceWith(f);
    }, { once: true });
  }
}
