(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const data = window.FIRST_AID_DATA || [];
  const modal = $("modal");
  let timerInterval = null, timerSeconds = 0, deferredInstall = null, compassHandler = null;

  function openModal(title, html, imageUrl = null) {
    $("modalTitle").textContent = title;
    $("modalContent").innerHTML = html;
    const img = $("previewImg");
    if (imageUrl) { img.src = imageUrl; img.hidden = false; } else { img.hidden = true; img.removeAttribute("src"); }
    modal.classList.add("show"); modal.setAttribute("aria-hidden", "false");
    $("closeModal").focus();
  }
  function closeModal() { modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); }
  $("closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  function showGuide(item) {
    const steps = item.steps.map(s => `<li>${escapeHTML(s)}</li>`).join("");
    openModal(item.title, `<p>${escapeHTML(item.summary)}</p><h3>خطوات أولية</h3><ol>${steps}</ol><p><b>مهم:</b> اتصل بالطوارئ في الحالات الخطرة ولا تؤخر طلب المساعدة.</p>`);
  }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  $("categoryGrid").innerHTML = data.map(item => `<button class="category-card" data-guide="${item.id}"><span class="service-icon">${item.icon}</span><strong>${item.title}</strong><small>${item.summary}</small></button>`).join("");
  $("urgentList").innerHTML = data.filter(x => x.urgent).slice(0,5).map(item => `<div class="urgent-item"><strong>${item.icon} ${item.title}</strong><button data-guide="${item.id}">عرض الإرشادات</button></div>`).join("");
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-guide]");
    if (btn) { const item = data.find(x => x.id === btn.dataset.guide); if (item) showGuide(item); }
  });

  $("searchInput").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    const results = $("searchResults");
    if (!q) { results.innerHTML = ""; return; }
    const matches = data.filter(x => (x.title + " " + x.summary + " " + x.steps.join(" ")).toLowerCase().includes(q));
    results.innerHTML = matches.length ? matches.map(x => `<button class="search-result" data-guide="${x.id}">${x.icon} ${x.title} — ${x.summary}</button>`).join("") : `<div class="empty">لا توجد نتيجة مطابقة. جرّب كلمة أخرى.</div>`;
  });

  function emergencyHTML() {
    const numbers = [
      ["997","الهلال الأحمر السعودي"],["998","الدفاع المدني"],["999","الدوريات الأمنية"],["911","الرقم الموحد للطوارئ في المناطق التي تتوفر فيها الخدمة"],["937","وزارة الصحة – الاستشارات الصحية"],["994","حرس الحدود"],["996","أمن الطرق"],["993","المرور"]
    ];
    return `<p>اختر الرقم المناسب حسب موقعك ونوع الحالة. قد تختلف تغطية بعض الأرقام حسب المنطقة.</p><div class="call-list">${numbers.map(([n,label])=>`<div class="call-row"><span>${label}</span><a href="tel:${n}">${n}</a></div>`).join("")}</div><p>إذا لم تكن متأكدًا، اتصل برقم الطوارئ المحلي المتاح واذكر موقعك بوضوح.</p>`;
  }
  function showEmergency() { openModal("🚨 أرقام الطوارئ", emergencyHTML()); }
  $("emergencyButton").addEventListener("click", showEmergency);
  $("navEmergency").addEventListener("click", showEmergency);
  $("sosButton").addEventListener("click", () => openModal("🚨 طلب المساعدة", `<p><b>إذا كانت هناك حالة تهدد الحياة، اتصل بالطوارئ الآن.</b></p>${emergencyHTML()}`));

  $("cameraButton").addEventListener("click", () => $("cameraInput").click());
  $("cameraInput").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    openModal("📸 الصورة المختارة", "<p>تم اختيار الصورة على جهازك. هذه النسخة لا تشخّص النباتات أو الثعابين من الصور؛ لا تقترب من الكائن ولا تلمسه، واستعن بمختص.</p>", url);
    e.target.value = "";
  });
  $("locationButton").addEventListener("click", () => {
    const url = "https://www.google.com/maps/search/?api=1&query=hospitals+near+me";
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("offlineButton").addEventListener("click", () => {
    openModal("📚 دليل الإسعافات", `<p>الأدلة الأساسية مضمّنة داخل التطبيق ويمكن فتحها دون اتصال بعد تحميل التطبيق مرة واحدة.</p><ul>${data.map(x=>`<li>${x.icon} ${x.title}</li>`).join("")}</ul>`);
  });

  $("startTimer").addEventListener("click", () => {
    clearInterval(timerInterval); timerSeconds = 0; updateTimer();
    timerInterval = setInterval(() => { timerSeconds++; updateTimer(); }, 1000);
  });
  $("stopTimer").addEventListener("click", () => clearInterval(timerInterval));
  function updateTimer() {
    const h = String(Math.floor(timerSeconds/3600)).padStart(2,"0");
    const m = String(Math.floor((timerSeconds%3600)/60)).padStart(2,"0");
    const s = String(timerSeconds%60).padStart(2,"0");
    $("timerDisplay").textContent = `${h}:${m}:${s}`;
  }

  $("themeButton").addEventListener("click", () => {
    document.body.classList.toggle("light");
    const light = document.body.classList.contains("light");
    $("themeButton").textContent = light ? "🌙" : "☀️";
    try { localStorage.setItem("musaef-theme", light ? "light" : "dark"); } catch (_) {}
  });
  try { if (localStorage.getItem("musaef-theme") === "light") { document.body.classList.add("light"); $("themeButton").textContent = "🌙"; } } catch (_) {}

  document.querySelectorAll(".nav-item[data-target]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const target = $(btn.dataset.target);
    if (target) target.scrollIntoView({behavior:"smooth",block:"start"});
  }));

  $("compassButton").addEventListener("click", async () => {
    try {
      if (typeof DeviceOrientationEvent === "undefined") throw new Error("unsupported");
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") throw new Error("denied");
      }
      if (compassHandler) window.removeEventListener("deviceorientationabsolute", compassHandler);
      compassHandler = event => {
        let heading = null;
        if (typeof event.webkitCompassHeading === "number") heading = event.webkitCompassHeading;
        else if (typeof event.alpha === "number") heading = (360 - event.alpha) % 360;
        if (heading === null || !Number.isFinite(heading)) return;
        heading = Math.round(heading);
        $("compassDisc").style.transform = `rotate(${-heading}deg)`;
        $("compassHeading").textContent = `${heading}°`;
        $("compassStatus").textContent = "مفعلة";
      };
      window.addEventListener("deviceorientationabsolute", compassHandler, true);
      window.addEventListener("deviceorientation", compassHandler, true);
      $("compassStatus").textContent = "بانتظار المستشعر";
    } catch (_) {
      $("compassStatus").textContent = "غير مدعومة";
      openModal("🧭 البوصلة", "<p>لم يتمكن المتصفح من الوصول إلى مستشعر الاتجاه. جرّب فتح التطبيق على هاتف يدعم البوصلة ومن خلال اتصال آمن HTTPS، واسمح بإذن المستشعر إذا ظهر.</p>");
    }
  });

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault(); deferredInstall = event; $("installButton").hidden = false;
  });
  $("installButton").addEventListener("click", async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $("installButton").hidden = true;
  });
  window.addEventListener("appinstalled", () => { $("installButton").hidden = true; });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(err => console.warn("تعذر تسجيل Service Worker", err)));
  }
})();