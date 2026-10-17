(() => {
  "use strict";
  const config = window.CALCULAFACIL_CONFIG || {};
  const button = document.getElementById("privacy-settings");
  const status = document.getElementById("consent-status");
  // Validate inputs before the existing calculator handlers run, including on preset buttons.
  document.addEventListener("click", event => {
    const trigger = event.target.closest("button[onclick]");
    if (!trigger || !/\b(?:calc|preset)\s*\(/.test(trigger.getAttribute("onclick") || "")) return;
    const fields = [...document.querySelectorAll(".toolbox input:not([type=checkbox]), .toolbox select")].filter(el => !el.closest("[hidden]") && el.getClientRects().length);
    for (const field of fields) {
      if (!field.value.trim() || !field.checkValidity()) {
        event.preventDefault(); event.stopImmediatePropagation();
        const result = document.getElementById("result");
        if (result) result.textContent = "Completa tots els camps amb valors vàlids i comprova els límits indicats.";
        field.reportValidity(); field.focus(); return;
      }
    }
  }, true);
  if (!config.advertisingEnabled || !/^ca-pub-\d{16}$/.test(config.publisherId)) return;
  if (button) {
    button.hidden = false;
    button.addEventListener("click", () => {
      if (window.googlefc?.showRevocationMessage) window.googlefc.showRevocationMessage();
      else if (status) status.textContent = "La plataforma de consentiment encara no està disponible. No es carreguen anuncis sense el consentiment comprovat.";
    });
  }
  if (status) status.textContent = "Pots revisar el consentiment amb el botó següent. Els anuncis només es carreguen després de comprovar el consentiment.";
  let loaded = false;
  function connect() {
    if (typeof window.__tcfapi !== "function") return;
    window.__tcfapi("addEventListener", 2, (tc, ok) => {
      if (!ok || !tc || !["tcloaded", "useractioncomplete"].includes(tc.eventStatus)) return;
      const consent = tc.purpose?.consents?.[1] && tc.vendor?.consents?.[755];
      if (!consent || loaded) return;
      loaded = true;
      const script = document.createElement("script");
      script.async = true; script.crossOrigin = "anonymous";
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + config.publisherId;
      document.head.appendChild(script);
    });
  }
  // The official CMP snippet/URL must be taken from the publisher's own account.
  if (config.cmpScriptUrl) {
    try {
      const url = new URL(config.cmpScriptUrl);
      if (url.protocol !== "https:") return;
      const script = document.createElement("script");
      script.async = true; script.src = url.href;
      script.onload = connect;
      document.head.appendChild(script);
    } catch { return; }
  }
  connect();
})();
