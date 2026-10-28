(() => {
  "use strict";

  const page = document.querySelector("[data-collab-page]");
  if (!page) return;
  const cards = Array.from(page.querySelectorAll("[data-collab-card]"));
  const detail = page.querySelector("[data-collab-detail]");
  const overview = page.querySelector("[data-map-overview]");
  const mapElement = page.querySelector("#collab-world-map");
  const reset = page.querySelector("[data-map-reset]");
  const markers = [];
  const locations = cards.map((card) => [Number(card.dataset.lat), Number(card.dataset.lng)]);
  const worldBounds = [[-90, -180], [90, 180]];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let map = null;
  let resizeObserver = null;
  let selected = 0;
  let showingOverview = true;

  function select(index, pan = true) {
    const card = cards[index];
    if (!card) return;
    selected = index;
    cards.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
      item.open = i === index;
    });
    detail.replaceChildren(...Array.from(card.querySelector("[data-person-detail]").childNodes,
      (node) => node.cloneNode(true)));
    overview.querySelectorAll("[data-map-location]").forEach((pin) => {
      pin.querySelector("circle").classList.toggle("is-active", Number(pin.dataset.mapLocation) === index);
      if (Number(pin.dataset.mapLocation) === index) overview.appendChild(pin);
    });
    markers.forEach((marker, i) => {
      const element = marker.getElement();
      if (element) {
        element.classList.toggle("is-active", i === index);
        element.setAttribute("aria-pressed", String(i === index));
      }
      marker.setZIndexOffset(i === index ? 1000 : 0);
    });
    if (map && pan) {
      showingOverview = false;
      map.flyTo(locations[index], 4, { animate: !reducedMotion, duration: 0.65 });
    }
  }

  // The list works independently of Leaflet. Without JS, native details still open.
  cards.forEach((card, index) => {
    const summary = card.querySelector("summary");
    summary.setAttribute("aria-controls", "collab-detail");
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      select(index);
    });
  });
  overview.querySelectorAll("[data-map-location]").forEach((pin) => {
    pin.addEventListener("click", (event) => {
      event.preventDefault();
      const index = Number(pin.dataset.mapLocation);
      select(index);
      cards[index].querySelector("summary").focus({ preventScroll: true });
    });
  });
  page.classList.add("is-enhanced");
  select(0, false);

  function showOverview() {
    if (!map) return;
    map.fitBounds(locations, {
      paddingTopLeft: [52, 40],
      paddingBottomRight: [24, 24],
      maxZoom: 2,
      animate: false
    });
    showingOverview = true;
  }

  function resizeMap() {
    if (!map) return;
    const keepOverview = showingOverview;
    map.stop();
    map.invalidateSize({ pan: false });
    const size = map.getSize();
    const worldSize = map.getPixelWorldBounds(0).getSize();
    // Prevent zooming out beyond the local image, including after phone rotation.
    map.setMinZoom(map.getScaleZoom(Math.max(size.x / worldSize.x, size.y / worldSize.y), 0));
    if (keepOverview) showOverview();
    map.panInsideBounds(worldBounds, { animate: false });
  }

  function restoreStaticMap() {
    page.classList.remove("is-map-ready");
    overview.removeAttribute("hidden");
    mapElement.hidden = true;
    reset.hidden = true;
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener("resize", resizeMap);
    // Retain the native overview and collaborator list even after a partial failure.
    const failedMap = map;
    map = null;
    markers.length = 0;
    if (failedMap) failedMap.remove();
  }

  if (!window.L) return;
  try {
    const L = window.L;
    mapElement.hidden = false;
    map = L.map(mapElement, {
      crs: L.CRS.EPSG4326,
      center: locations[0],
      zoom: 4,
      minZoom: -2,
      maxZoom: 6,
      zoomSnap: 0,
      zoomDelta: 0.5,
      zoomAnimation: false,
      bounceAtZoomLimits: false,
      trackResize: false,
      scrollWheelZoom: false,
      maxBounds: worldBounds,
      maxBoundsViscosity: 1,
      attributionControl: false
    });

    // This local vector image replaces hosted tiles; no API keys or network provider.
    const basemap = L.imageOverlay(mapElement.dataset.mapImage, worldBounds);
    basemap.on("load", () => {
      if (!map) return;
      resizeMap();
      page.classList.add("is-map-ready");
      overview.setAttribute("hidden", "");
      reset.hidden = false;
      select(selected, false);
    });
    basemap.on("error", restoreStaticMap);
    basemap.addTo(map);

    const pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.6"></circle></svg>';
    cards.forEach((card, index) => {
      const icon = L.divIcon({ className: "collab-pin", html: pin, iconSize: [30, 30], iconAnchor: [15, 29] });
      const marker = L.marker(locations[index], {
        icon,
        title: `${card.dataset.name} — ${card.dataset.place}`,
        alt: card.dataset.name,
        keyboard: true
      }).addTo(map).on("click", () => select(index));
      const label = document.createElement("span");
      label.textContent = card.dataset.name;
      marker.bindTooltip(label, { direction: "top", offset: [0, -24] });
      markers.push(marker);
    });
    // Only user interaction leaves the overview; layout changes must keep every pin in view.
    const leaveOverview = () => { showingOverview = false; };
    mapElement.addEventListener("pointerdown", leaveOverview);
    mapElement.addEventListener("keydown", leaveOverview);
    reset.addEventListener("click", showOverview);
    resizeMap();
    select(selected, false);
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(resizeMap);
      resizeObserver.observe(mapElement);
    } else {
      window.addEventListener("resize", resizeMap);
    }
  } catch (error) {
    restoreStaticMap();
    console.warn("Collaborator map: using the static overview.", error);
  }
})();
