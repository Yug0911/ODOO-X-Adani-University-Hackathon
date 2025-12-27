const BASE_URL = "http://localhost:5173";

const form = document.getElementById("maintenanceForm");
const statusText = document.getElementById("status");
const selectedIdDropdown = document.getElementById("selectedId");
const maintenanceFor = document.getElementById("maintenanceFor");

// Load Equipment list by default
loadTargets("Equipment");

// Switch dropdown when Equipment / Work Center changes
maintenanceFor.addEventListener("change", () => {
  loadTargets(maintenanceFor.value);
});

async function loadTargets(type) {
  selectedIdDropdown.innerHTML = "";

  const endpoint =
    type === "Equipment" ? "/api/equipment" : "/api/work-centers";

  try {
    const res = await fetch(BASE_URL + endpoint);
    const data = await res.json();

    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      selectedIdDropdown.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    statusText.innerText = "Failed to load data";
  }
}

// Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    subject: document.getElementById("subject").value,
    maintenance_for: maintenanceFor.value,
    selected_id: selectedIdDropdown.value,
    request_type: document.getElementById("requestType").value,
    assigned_technician_id: document.getElementById("technicianId").value,
    scheduled_date: document.getElementById("scheduledDate").value,
  };

  try {
    const res = await fetch(BASE_URL + "/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("API error");

    statusText.innerText = "Request created successfully ✅";
    form.reset();
  } catch (err) {
    console.error(err);
    statusText.innerText = "API not connected ❌";
  }
});
