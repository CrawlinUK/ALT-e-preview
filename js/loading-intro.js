/* LD-unit: actual loading. TL-unit: independent introductory overlay. */
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
    const overlay = document.getElementById("titleOverlay");
    const introTitle = document.getElementById("introTitle");
    const label = document.getElementById("loadingLabel");
    let started = false, loaded = false, failed = false;
    let holdTimer = null, fadeTimer = null;

    function showTitle(value) {
      if (started || failed) return;
      started = true;
      if (title) title.textContent = value;
      if (introTitle) introTitle.textContent = value;
      if (!overlay) return;
      overlay.hidden = false;
      holdTimer = setTimer(() => {
        holdTimer = null;
        overlay.classList.add("title-fading");
        fadeTimer = setTimer(() => {
          fadeTimer = null;
          overlay.remove();
        }, 500);
      }, 1500);
    }

    function ready() {
      if (failed || loaded) return;
      loaded = true;
      // Never delay the actual classroom for the title animation.
      if (screen) screen.remove();
    }

    function error() {
      if (loaded || failed) return;
      failed = true;
      if (holdTimer !== null) clearTimer(holdTimer);
      if (fadeTimer !== null) clearTimer(fadeTimer);
      if (overlay) overlay.remove();
      if (label) label.textContent = "Could not load";
      if (screen) screen.classList.add("loading-error");
    }
    return Object.freeze({ showTitle, ready, error });
  }
  global.ALTE_LOADING_INTRO = Object.freeze({ create, formatTitle });
})(window);
