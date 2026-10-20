const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
$("menuToggle").addEventListener("click", () => $("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => $("nav").classList.remove("open")));

let currentMode = "instant";
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  currentMode = tab.dataset.tab;
  $("autoNotice").classList.toggle("hidden", currentMode !== "auto");
  $("sendBtn").textContent = currentMode === "auto" ? "Check AutoLikes Setup →" : "Send Likes Now →";
}));

$("resetBtn").addEventListener("click", () => {
  $("likesForm").reset();
  $("formMessage").textContent = "";
});
$("likesForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentMode === "auto") {
    showModal("AutoLikes setup required", "Recurring delivery is not enabled yet. Configure an authorized likes API and a background scheduler before activating paid automatic deliveries.");
    return;
  }
  const btn = $("sendBtn");
  btn.disabled = true;
  $("formMessage").textContent = "Checking configuration…";
  try {
    const res = await fetch("/api/likes/send", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({uid:$("uid").value.trim(), coupon:$("coupon").value.trim(), region:$("region").value})
    });
    const data = await res.json();
    $("formMessage").textContent = data.error || (data.message || "Request processed.");
  } catch {
    $("formMessage").textContent = "Could not contact the server. Please try again.";
  } finally { btn.disabled = false; }
});

document.querySelectorAll(".buy").forEach(btn => btn.addEventListener("click", () => {
  showModal("Payment gateway not connected", `${btn.dataset.package} is a sample package. Add your payment provider credentials and server-side payment verification before accepting payments or issuing coupons.`);
}));
document.querySelectorAll("[data-tool]").forEach(btn => btn.addEventListener("click", async () => {
  const name = btn.dataset.tool;
  if (name === "Stats") {
    try {
      const res = await fetch("/api/stats");
      const d = await res.json();
      showModal("Service statistics", `Successful sends recorded: ${d.sends ?? 0}. ${d.note || ""}`);
    } catch { showModal("Stats unavailable", "Could not load statistics from the server."); }
  } else {
    showModal(`${name} integration required`, "This tool's interface is prepared, but it needs a documented and authorized API before it can return real player data or perform account actions.");
  }
}));

function showModal(title, message) {
  $("modalTitle").textContent = title;
  $("modalText").textContent = message;
  $("modal").classList.remove("hidden");
}
function closeModal() { $("modal").classList.add("hidden"); }
$("closeModal").addEventListener("click", closeModal);
$("modalOk").addEventListener("click", closeModal);
$("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });

fetch("/api/stats").then(r => r.json()).then(d => {
  if (typeof d.sends === "number") $("sendCount").textContent = d.sends.toLocaleString();
}).catch(() => $("sendCount").textContent = "—");
