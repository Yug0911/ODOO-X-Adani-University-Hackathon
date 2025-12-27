
const BASE_URL = "http://localhost:3000"; // example

function loadDashboardStats() {
  fetch(`${BASE_URL}/api/dashboard/stats`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("criticalEquipment").innerText =
        data.critical_equipment + " Units";

      document.getElementById("openRequests").innerText =
        data.open_requests.pending +
        " Pending | " +
        data.open_requests.overdue +
        " Overdue";
    })
    .catch(() => {
      document.getElementById("openRequests").innerText = "API Not Connected";
    });
}

function loadRequests() {
  fetch(`${BASE_URL}/api/kanban`)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";

      data.forEach((r) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${r.subject || "-"}</td>
          <td>${r.target_name || "-"}</td>
          <td>${r.assigned_technician_name || "-"}</td>
          <td>${r.stage || "-"}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(() => {
      console.log("Kanban API not reachable");
    });
}

// INIT
loadDashboardStats();
loadRequests();
