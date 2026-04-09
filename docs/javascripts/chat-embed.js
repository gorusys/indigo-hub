/**
 * Indigo Hub AI: floating launcher + iframe to the Next.js /embed route.
 * Set mkdocs `extra.chat_embed_url` to the full URL (e.g. https://your-app.vercel.app/embed).
 */
(function () {
  var url = typeof window !== "undefined" && window.__INDIGO_CHAT_EMBED_URL__;
  if (!url || typeof url !== "string" || url.length === 0) {
    return;
  }

  var existingBtn = document.getElementById("indigo-chat-launcher");
  var existingFrame = document.getElementById("indigo-chat-frame");
  if (existingBtn) {
    if (existingFrame && existingFrame.tagName === "IFRAME") {
      existingFrame.setAttribute("src", url);
    }
    return;
  }

  var btn = document.createElement("button");
  btn.id = "indigo-chat-launcher";
  btn.setAttribute("aria-label", "Open Indigo Hub AI");
  btn.setAttribute("type", "button");
  btn.style.cssText =
    "position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;width:2.6rem;height:2.6rem;border-radius:9999px;border:1px solid #7c83ff;background:linear-gradient(180deg,#818cf8,#6366f1);color:#fff;cursor:pointer;box-shadow:0 12px 24px rgba(99,102,241,0.42);align-items:center;justify-content:center;display:flex;";

  function setLauncherIcon(isOpen) {
    if (isOpen) {
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
      btn.setAttribute("aria-label", "Close Indigo Hub AI");
    } else {
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>';
      btn.setAttribute("aria-label", "Open Indigo Hub AI");
    }
  }
  setLauncherIcon(false);

  var wrap = document.createElement("div");
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-label", "Indigo Hub AI");
  wrap.style.cssText =
    "position:fixed;bottom:6rem;right:1.5rem;z-index:9998;width:min(380px,calc(100vw - 2rem));height:560px;max-height:calc(100vh - 8rem);display:none;border-radius:1rem;overflow:hidden;border:1px solid #3f3f46;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);background:#18181b;";

  var iframe = document.createElement("iframe");
  iframe.id = "indigo-chat-frame";
  iframe.setAttribute("title", "Indigo Hub AI");
  iframe.setAttribute("loading", "lazy");
  iframe.style.cssText = "width:100%;height:100%;border:0;background:#18181b;";
  iframe.setAttribute("src", url);
  wrap.appendChild(iframe);

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    wrap.style.display = open ? "block" : "none";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    setLauncherIcon(open);
  });

  document.body.appendChild(wrap);
  document.body.appendChild(btn);
})();
