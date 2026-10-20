// Change this when deploying the backend. For local development, backend runs on port 3000.
const API_BASE = "http://localhost:3000/api";
const byId = (id) => document.getElementById(id);
byId("year").textContent = new Date().getFullYear();

function showResult(el, message, isHtml = false) {
  el.hidden = false;
  if (isHtml) el.innerHTML = message;
  else el.textContent = message;
}

byId("order-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  const result = byId("result");
  button.disabled = true;
  button.textContent = "Creating order…";
  try {
    const payload = {
      product: byId("product").value,
      uid: byId("uid").value.trim(),
      region: byId("region").value,
      amount: Number(byId("amount").value)
    };
    const response = await fetch(`${API_BASE}/payment/create-order`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not create order");
    let html = `<strong>Order created</strong><br>Order ID: <code>${escapeHtml(data.orderId)}</code><br>Status: ${escapeHtml(data.status || "pending")}<br>${escapeHtml(data.message || "")}`;
    if (data.paymentUrl) html += `<br><a href="${safeUrl(data.paymentUrl)}" target="_blank" rel="noopener noreferrer">Continue to payment ↗</a>`;
    showResult(result, html, true);
  } catch (error) {
    showResult(result, `${error.message}. Check that the backend is running and API_BASE is correct.`);
  } finally {
    button.disabled = false;
    button.innerHTML = 'Create order <span>↗</span>';
  }
});

byId("track-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = byId("track-id").value.trim();
  const result = byId("track-result");
  try {
    const response = await fetch(`${API_BASE}/payment/status/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Order lookup failed");
    showResult(result, `Order: ${data.orderId}\nProduct: ${data.product}\nAmount: ₹${data.amount}\nStatus: ${data.status}\nCreated: ${new Date(data.createdAt).toLocaleString()}`);
  } catch (error) {
    showResult(result, error.message);
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function safeUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? escapeHtml(url.href) : "#"; }
  catch { return "#"; }
}
