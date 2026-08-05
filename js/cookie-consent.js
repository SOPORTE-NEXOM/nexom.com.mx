(() => {
  const banner = document.getElementById("cookieBanner");
  const accept = document.getElementById("cookieAccept");
  const reject = document.getElementById("cookieReject");
  if (!banner || !accept || !reject) return;

  const storageKey = "nexom-cookie-consent";
  let savedPreference = null;
  try {
    savedPreference = localStorage.getItem(storageKey);
  } catch (_) {
    savedPreference = null;
  }

  if (!savedPreference) banner.classList.add("is-visible");

  const savePreference = (value) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch (_) {
      // El sitio sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
    banner.classList.remove("is-visible");
    document.dispatchEvent(new CustomEvent("nexom:cookie-consent", { detail: value }));
  };

  accept.addEventListener("click", () => savePreference("accepted"));
  reject.addEventListener("click", () => savePreference("essential-only"));
})();
