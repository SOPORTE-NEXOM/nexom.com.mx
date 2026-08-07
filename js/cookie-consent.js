(() => {
  const banner = document.getElementById("cookieBanner");
  const accept = document.getElementById("cookieAccept");
  const reject = document.getElementById("cookieReject");
  const preferencesButton = document.getElementById("cookiePreferences");
  const preferenceStatus = document.getElementById("cookiePreferenceStatus");
  if (!banner && !preferencesButton && !preferenceStatus) return;

  const storageKey = "nexom-cookie-consent";
  let savedPreference = null;
  try {
    savedPreference = localStorage.getItem(storageKey);
  } catch (_) {
    savedPreference = null;
  }

  if (!savedPreference && banner) banner.classList.add("is-visible");

  const updatePreferenceUI = (value) => {
    const essentialOnly = value === "essential-only";
    if (preferencesButton) {
      preferencesButton.setAttribute("aria-pressed", String(essentialOnly));
      const label = preferencesButton.querySelector("span");
      if (label) {
        label.textContent = essentialOnly
          ? "Permitir cookies no esenciales"
          : "Desactivar cookies no esenciales";
      }
    }
    if (preferenceStatus) {
      preferenceStatus.textContent = essentialOnly
        ? "Preferencia actual: solo almacenamiento esencial."
        : value === "accepted"
          ? "Preferencia actual: cookies no esenciales permitidas."
          : "Aún no has guardado una preferencia.";
    }
  };

  const savePreference = (value) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch (_) {
      // El sitio sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
    if (banner) banner.classList.remove("is-visible");
    savedPreference = value;
    updatePreferenceUI(value);
    document.dispatchEvent(new CustomEvent("nexom:cookie-consent", { detail: value }));
  };

  accept?.addEventListener("click", () => savePreference("accepted"));
  reject?.addEventListener("click", () => savePreference("essential-only"));
  preferencesButton?.addEventListener("click", () => {
    savePreference(savedPreference === "essential-only" ? "accepted" : "essential-only");
  });

  updatePreferenceUI(savedPreference);
})();
