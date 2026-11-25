/* A single loading title: hold for 1.5s, then fade for 0.5s once ready. */
(function (global) {
  "use strict";
  function formatTitle(config) {
    const title = String(config.unitTitle || "").trim();
    return config.bookId === "categories" || !config.unitNumber
      ? title || "ALT-e" : ["Unit", config.unitNumber, title].filter(Boolean).join(" ");
  }

  function create({ document, setTimer, clearTimer }) {
    const screen = document.getElementById("loadingScreen");
    const title = document.getElementById("loadingTitle");
    const label = document.getElementById("loadingLabel");
    let holdTimer = null, minimumMet = false, loaded = false, failed = false, fading = false;
    function finish() {
      if (!screen || failed || fading || !minimumMet || !loaded) return;
      fading = true;
      screen.classList.add("loading-complete");
      setTimer(() => screen.remove(), 500);
    }
    function showTitle(value) {
      if (failed || fading || holdTimer !== null || minimumMet) return;
      if (title) title.textContent = value;
      holdTimer = setTimer(() => {
        holdTimer = null;
        minimumMet = true;
        finish();
      }, 1500);
    }
    function ready() {
      if (failed) return;
      loaded = true;
      if (screen) screen.classList.add("loading-ready");
      finish();
    }
    function error() {
      failed = true;
      if (holdTimer !== null) clearTimer(holdTimer);
      if (label) label.textContent = "Could not load";
      if (screen) screen.classList.add("loading-error");
    }
    return Object.freeze({ showTitle, ready, error });
  }
  global.ALTE_LOADING_INTRO = Object.freeze({ create, formatTitle });
})(window);
