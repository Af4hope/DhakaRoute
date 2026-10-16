/**
 * DhakaPath - Live Urban Transit & Route Intelligence Engine
 * Official Solution for IAIT National IT Fest 2026 Smart City Hackathon
 * 100% Free Stack (Leaflet, OpenStreetMap, Web Speech API, Local NLP, Socket.IO)
 */

// 1. Coordinates of 14 Major Dhaka Transit Hubs (Hackathon Constraints)
const locations = {
  "Mirpur 10": [23.8067, 90.3686],
  "Uttara": [23.8759, 90.3795],
  "Agargaon": [23.7785, 90.3795],
  "Mohakhali": [23.7778, 90.4054],
  "Farmgate": [23.7578, 90.3890],
  "Dhanmondi": [23.7461, 90.3742],
  "Science Lab": [23.7397, 90.3831],
  "Mohammadpur": [23.7570, 90.3606],
  "Shahbagh": [23.7389, 90.3958],
  "Malibagh": [23.7483, 90.4124],
  "Banasree": [23.7629, 90.4328],
  "Badda": [23.7806, 90.4267],
  "Motijheel": [23.7330, 90.4172],
  "Jatrabari": [23.7118, 90.4334]
};

// 2. Alert metadata & visual configurations
const alertConfig = {
  "Waterlogging": { icon: "🌧️", color: "#e9a23b", label: "Waterlogging" },
  "Roadblock": { icon: "🚧", color: "#e05252", label: "Roadblock" },
  "Traffic jam": { icon: "🚗", color: "#f97316", label: "Traffic jam" },
  "Construction": { icon: "🏗️", color: "#7c68c4", label: "Construction" }
};

// 3. Transit Network Catalog (Part 1: Transit CMS)
const transitCatalog = [
  {
    id: "net-mrt6",
    title: "MRT Line-6 Metro Rail",
    mode: "Metro",
    class: "mode-metro",
    path: "Uttara North ⇄ Mirpur 10 ⇄ Farmgate ⇄ Shahbagh ⇄ Motijheel",
    stations: 16,
    fare: "৳20 - ৳100 (MRT Pass 10% Off)",
    studentHalfPass: "Standard DMTCL rate applies",
    time: "32 mins full corridor",
    boarding: "Board via concourse escalators / AFC gates at all stations."
  },
  {
    id: "net-bus-shikor",
    title: "Shikor Paribahan (Bus)",
    mode: "Bus",
    class: "mode-bus",
    path: "Mirpur 12 ⇄ Mirpur 10 ⇄ Agargaon ⇄ Farmgate ⇄ Shahbagh ⇄ Motijheel",
    stations: 12,
    fare: "৳35 standard ticket",
    studentHalfPass: "Eligible (50% Off · ৳18)",
    time: "45 - 65 mins",
    boarding: "Mirpur 10 Roundabout Bus Bay / Farmgate Footbridge."
  },
  {
    id: "net-bus-raida",
    title: "Raida Enterprise (Bus)",
    mode: "Bus",
    class: "mode-bus",
    path: "Uttara House Building ⇄ Airport ⇄ Kuril ⇄ Badda ⇄ Malibagh ⇄ Jatrabari",
    stations: 18,
    fare: "৳50 full distance",
    studentHalfPass: "Eligible (50% Off · ৳25)",
    time: "55 - 80 mins",
    boarding: "Badda Link Road / Malibagh Railgate counters."
  },
  {
    id: "net-leg-4",
    title: "Leguna Corridor 4 (Human Hauler)",
    mode: "Leguna",
    class: "mode-leguna",
    path: "Farmgate (Ananda Cinema) ⇄ Asad Gate ⇄ Mohammadpur Town Hall",
    stations: 6,
    fare: "৳20 fixed seat fare",
    studentHalfPass: "Not Accepted on Leguna",
    time: "18 - 25 mins",
    boarding: "Farmgate behind police box station / Town Hall rickshaw stand."
  },
  {
    id: "net-leg-7",
    title: "Leguna Corridor 7 (Feeder Route)",
    mode: "Leguna",
    class: "mode-leguna",
    path: "Mirpur 10 Roundabout ⇄ Shewrapara ⇄ Agargaon Passport Office",
    stations: 5,
    fare: "৳15 fixed fare",
    studentHalfPass: "Not Accepted on Leguna",
    time: "15 mins",
    boarding: "Mirpur 10 Fire Station alley / Agargaon BRTA road."
  },
  {
    id: "net-rick-scilab",
    title: "Connector Rickshaw Feeder",
    mode: "Rickshaw",
    class: "mode-rickshaw",
    path: "Science Lab ⇄ Dhanmondi Road 27 / Rangs Fortune Square",
    stations: 4,
    fare: "৳40 - ৳60 (Surge ৳80 in rain)",
    studentHalfPass: "Flat negotiated rate",
    time: "12 - 18 mins",
    boarding: "Science Lab Footbridge corner / Dhanmondi 27 Mina Bazar."
  }
];

// Initial Demonstration Disruption Reports
let initialReports = [
  {
    id: "rep-demo-1",
    location: "Dhanmondi",
    type: "Waterlogging",
    description: "Moderate knee-deep water accumulation near Road 27. Slow rickshaw & car movement.",
    time: "15m ago",
    upvotes: 4,
    verified: true,
    status: "COMMUNITY VERIFIED (4 confirms)"
  },
  {
    id: "rep-demo-2",
    location: "Farmgate",
    type: "Roadblock",
    description: "Temporary road diversion and barricade near intersection for street drainage maintenance.",
    time: "35m ago",
    upvotes: 2,
    verified: false,
    status: "COMMUNITY REPORT · UNVERIFIED"
  },
  {
    id: "rep-demo-3",
    location: "Mirpur 10",
    type: "Traffic jam",
    description: "Heavy congestion around roundabout bottleneck near bus stoppage.",
    time: "45m ago",
    upvotes: 6,
    verified: true,
    status: "COMMUNITY VERIFIED (6 confirms)"
  }
];

// Global Application State
let map = null;
let routeLine = null;
let routeMarkers = [];
let alertMarkers = [];
let detourMarkers = [];
let socket = null;
let reports = [];
let currentFilter = "All";
let activeScenario = "normal";
let adminMode = false;
let currentRouteBriefing = null;

// 4. Toast Notification Utility
function showToast(message) {
  let toast = document.getElementById("dhaka-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "dhaka-toast";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// 5. Admin Mode Toggle
function toggleAdminMode() {
  adminMode = !adminMode;
  const btn = document.getElementById("admin-mode-toggle");
  const text = document.getElementById("admin-status-text");
  if (btn && text) {
    if (adminMode) {
      btn.classList.add("active");
      text.textContent = "ON";
      showToast("⚙️ Admin CMS mode activated. You can now moderate/remove live reports.");
    } else {
      btn.classList.remove("active");
      text.textContent = "OFF";
      showToast("Admin CMS mode deactivated.");
    }
  }
  DhakaAlerts.render();
}

// 6. Interactive Scenario Simulation Engine (Part 3)
function simulateScenario(scenario) {
  activeScenario = scenario;

  document.querySelectorAll(".simulation-bar .sim-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`sim-btn-${scenario}`);
  if (activeBtn) activeBtn.classList.add("active");

  // Clear previous scenario alerts
  reports = reports.filter(r => !r.isSimulated);

  if (scenario === "rain") {
    reports.unshift({
      id: "sim-rain-1",
      location: "Dhanmondi",
      type: "Waterlogging",
      description: "[SIMULATED SCENARIO] Heavy monsoon flash flood at Dhanmondi 27 & Mirpur Road. Knee-high waterlogging.",
      time: "Simulated Live",
      upvotes: 12,
      verified: true,
      status: "SCENARIO TRIGGER · FLOOD ALERT",
      isSimulated: true
    });
    showToast("🌧️ Scenario: Heavy Monsoon Flood simulated in Dhanmondi. Rickshaw surge (+50%) active & detour recommended!");
  } else if (scenario === "blockade") {
    reports.unshift({
      id: "sim-block-1",
      location: "Farmgate",
      type: "Roadblock",
      description: "[SIMULATED SCENARIO] Farmgate main intersection blocked by civic demonstration. Direct road closed; detour via Agargaon.",
      time: "Simulated Live",
      upvotes: 18,
      verified: true,
      status: "SCENARIO TRIGGER · INTERSECTION BLOCKED",
      isSimulated: true
    });
    showToast("🚧 Scenario: Farmgate intersection blocked. Intelligent detour calculation active!");
  } else if (scenario === "rush") {
    reports.unshift({
      id: "sim-rush-1",
      location: "Mirpur 10",
      type: "Traffic jam",
      description: "[SIMULATED SCENARIO] Evening peak office rush hour gridlock. Bus travel times increased by 75%.",
      time: "Simulated Live",
      upvotes: 15,
      verified: true,
      status: "SCENARIO TRIGGER · GRIDLOCK",
      isSimulated: true
    });
    showToast("🚗 Scenario: Peak Evening Gridlock active! Metro Rail prioritized over road transit.");
  } else {
    showToast("🔄 Traffic conditions restored to normal demonstration state.");
  }

  DhakaAlerts.render();

  // If a route is already calculated, recalculate dynamically to show detour!
  const originVal = document.getElementById("origin")?.value;
  const destVal = document.getElementById("destination")?.value;
  if (originVal && destVal && originVal !== destVal) {
    calculateMultiLegJourney();
  }
}

// 7. Alert Manager (CMS, Corroboration & Leaflet Map Pins)
const DhakaAlerts = {
  init() {
    const saved = localStorage.getItem("dhakaPath_alerts");
    if (saved) {
      try {
        reports = JSON.parse(saved);
        if (!Array.isArray(reports) || reports.length === 0) {
          reports = [...initialReports];
        }
      } catch (e) {
        reports = [...initialReports];
      }
    } else {
      reports = [...initialReports];
    }

    this.bindFilters();
    this.render();
    this.bindForm();
    this.initSocket();
  },

  save() {
    const persistent = reports.filter(r => !r.isSimulated);
    localStorage.setItem("dhakaPath_alerts", JSON.stringify(persistent));
  },

  bindFilters() {
    const filterButtons = document.querySelectorAll(".alert-filters .filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter") || "All";
        this.render();
      });
    });
  },

  addReport(data, broadcast = true) {
    // Sanity check (Part 4)
    if (!data.description || data.description.trim().length < 5) {
      showToast("⚠️ Sanity Check Failed: Disruption description is too short.");
      return;
    }

    const newReport = {
      id: "alert-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      location: data.location,
      type: data.type || "Traffic jam",
      description: data.description.trim(),
      time: "Just now",
      upvotes: 1,
      verified: false,
      status: "COMMUNITY REPORT · UNVERIFIED"
    };

    reports.unshift(newReport);
    this.save();
    this.render();

    const icon = (alertConfig[newReport.type] && alertConfig[newReport.type].icon) || "⚠️";
    showToast(`${icon} <strong>${newReport.type}</strong> recorded in ${newReport.location}! Pinned to map.`);

    if (broadcast && socket && socket.connected) {
      socket.emit("report:add", {
        location: newReport.location,
        type: newReport.type,
        description: newReport.description
      });
    }

    if (map && locations[newReport.location]) {
      map.flyTo(locations[newReport.location], 13.5, { duration: 0.8 });
    }
  },

  confirmReport(id) {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    report.upvotes = (report.upvotes || 0) + 1;
    if (report.upvotes >= 2) {
      report.verified = true;
      report.status = `COMMUNITY VERIFIED (${report.upvotes} confirms)`;
    }
    this.save();
    this.render();
    showToast(`👍 Corroborated report for ${report.location}. Community trust score increased!`);
  },

  resolveReport(id) {
    const reportIndex = reports.findIndex(r => r.id === id);
    if (reportIndex === -1) return;

    const removed = reports.splice(reportIndex, 1)[0];
    this.save();
    this.render();
    showToast(`✓ Marked disruption at ${removed.location} as resolved.`);
  },

  syncFromServer(serverReports) {
    if (!Array.isArray(serverReports) || serverReports.length === 0) return;

    const existingIds = new Set(reports.map(r => r.id));
    serverReports.forEach(sr => {
      if (!existingIds.has(sr.id)) {
        reports.unshift({
          id: sr.id,
          location: sr.location,
          type: sr.type,
          description: sr.description,
          time: sr.createdAt ? new Date(sr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          upvotes: 1,
          verified: false,
          status: "COMMUNITY REPORT · UNVERIFIED"
        });
      }
    });

    this.render();
  },

  render() {
    const list = document.getElementById("alerts-list");
    const countBadge = document.getElementById("alert-count");

    if (countBadge) {
      countBadge.textContent = String(reports.length).padStart(2, "0");
    }

    if (map) {
      alertMarkers.forEach(m => map.removeLayer(m));
      alertMarkers = [];
    }

    if (!list) return;
    list.innerHTML = "";

    const filteredReports = currentFilter === "All"
      ? reports
      : reports.filter(r => r.type === currentFilter);

    if (filteredReports.length === 0) {
      list.innerHTML = `<div class="empty-message">No reported ${currentFilter === "All" ? "disruptions" : currentFilter.toLowerCase() + " incidents"} active under this filter.</div>`;
      return;
    }

    filteredReports.forEach((report, index) => {
      const cfg = alertConfig[report.type] || { icon: "⚠️", color: "#f97316" };

      const item = document.createElement("div");
      item.className = "alert-item" + (index === 0 ? " highlight" : "");

      item.innerHTML = `
        <div class="alert-symbol" style="background: ${cfg.color}22;">
          ${cfg.icon}
        </div>
        <div style="flex: 1; min-width: 0;">
          <h3>
            <span>${report.type} · ${report.location}</span>
          </h3>
          <p>${report.description}</p>
          <div class="alert-meta">
            <span class="alert-status" style="${report.verified ? 'background: #d1fae5; color: #065f46;' : ''}">${report.status}</span>
            <span class="alert-time">⏱ ${report.time || 'Live'}</span>
            <span class="alert-map-hint">📍 View on Map</span>
          </div>
          <div class="alert-actions">
            <button class="alert-btn-confirm" title="Corroborate this report">👍 Confirm (${report.upvotes || 1})</button>
            <button class="alert-btn-resolve" title="Mark this issue cleared">✓ Mark Cleared</button>
            ${adminMode ? `<button class="alert-btn-resolve" style="background:#fee2e2; color:#b91c1c;" title="Admin Delete">🗑 Remove (Admin)</button>` : ''}
          </div>
        </div>
      `;

      item.querySelector("h3").addEventListener("click", () => this.locateOnMap(report));
      item.querySelector("p").addEventListener("click", () => this.locateOnMap(report));

      const confirmBtn = item.querySelector(".alert-btn-confirm");
      confirmBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.confirmReport(report.id);
      });

      const resolveBtn = item.querySelector(".alert-btn-resolve");
      resolveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.resolveReport(report.id);
      });

      list.appendChild(item);

      // Add circle marker to map
      if (map && locations[report.location]) {
        const marker = L.circleMarker(locations[report.location], {
          radius: report.verified ? 11 : 9,
          color: cfg.color,
          fillColor: cfg.color,
          fillOpacity: 0.85,
          weight: 2
        }).addTo(map);

        marker.__reportId = report.id;
        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 180px;">
            <div style="font-size: 11px; text-transform: uppercase; color: ${cfg.color}; font-weight: 800; letter-spacing: 0.5px;">${report.type}</div>
            <strong style="font-size: 14px; color: #142b2b; display: block; margin: 3px 0;">${report.location}</strong>
            <p style="margin: 4px 0 6px; font-size: 12px; color: #555; line-height: 1.4;">${report.description}</p>
            <span style="display: inline-block; font-size: 9px; font-weight: 700; color: ${report.verified ? '#065f46' : '#99610a'}; background: ${report.verified ? '#d1fae5' : '#fff1d7'}; padding: 2px 6px; border-radius: 4px;">
              ${report.status}
            </span>
          </div>
        `);

        alertMarkers.push(marker);
      }
    });
  },

  locateOnMap(report) {
    if (map && locations[report.location]) {
      map.flyTo(locations[report.location], 14, { duration: 0.8 });
      const targetMarker = alertMarkers.find(m => m.__reportId === report.id);
      if (targetMarker) targetMarker.openPopup();
    }
  },

  bindForm() {
    const form = document.getElementById("alert-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const locationSelect = document.getElementById("alert-location");
      const typeSelect = document.getElementById("alert-type");
      const descInput = document.getElementById("alert-description");

      const location = locationSelect ? locationSelect.value.trim() : "";
      const type = typeSelect ? typeSelect.value.trim() : "Traffic jam";
      const description = descInput ? descInput.value.trim() : "";

      this.addReport({
        location,
        type,
        description
      }, true);

      if (descInput) descInput.value = "";
    });
  },

  initSocket() {
    if (typeof io !== "undefined") {
      try {
        socket = io({ timeout: 3000, reconnectionAttempts: 2 });
        window.dhakaSocket = socket;

        socket.on("connect", () => {
          const badge = document.querySelector(".live-badge");
          if (badge) {
            badge.textContent = "● Live Network Active";
            badge.style.background = "#d1fae5";
            badge.style.color = "#047857";
          }
        });

        socket.on("reports:update", (serverReports) => {
          this.syncFromServer(serverReports);
        });

        socket.on("disconnect", () => {
          const badge = document.querySelector(".live-badge");
          if (badge) badge.textContent = "● City Explorer (Local)";
        });
      } catch (err) {
        console.log("Socket connection skipped in local mode.");
      }
    }
  }
};

// 8. Multi-Leg Routing Engine (Part 2 & Part 3)
function calculateDistance(a, b) {
  const radians = value => value * Math.PI / 180;
  const earthRadius = 6371;

  const lat1 = radians(a[0]);
  const lat2 = radians(b[0]);
  const deltaLat = radians(b[0] - a[0]);
  const deltaLng = radians(b[1] - a[1]);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function calculateMultiLegJourney() {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;
  const transport = document.getElementById("transport").value;
  const isStudent = document.getElementById("student-pass")?.checked || false;
  const isRainSurge = document.getElementById("rain-surge")?.checked || false;

  if (origin === destination) {
    showToast("⚠️ Starting point and destination must be different.");
    return;
  }

  const start = locations[origin];
  const end = locations[destination];
  if (!start || !end) return;

  const rawDist = calculateDistance(start, end);

  // Check if Farmgate Blockade scenario is active and route passes near Farmgate
  let isDetoured = false;
  let detourWaypoint = null;
  let detourText = "";

  if (activeScenario === "blockade" && (origin === "Farmgate" || destination === "Farmgate" || (rawDist > 5 && !origin.includes("Metro") && !destination.includes("Metro")))) {
    isDetoured = true;
    detourWaypoint = locations["Agargaon"];
    detourText = "⚠️ Farmgate blockade active! Route automatically rerouted through Agargaon-Bijoy Sarani bypass (+12 min, +৳15).";
  }

  const roadMultiplier = { "Metro": 1.25, "Bus": 1.5, "Leguna": 1.4, "Rickshaw": 1.3 };
  const speedKmH = { "Metro": 30, "Bus": 12, "Leguna": 14, "Rickshaw": 8 };
  const baseRateKm = { "Metro": 7.5, "Bus": 4.5, "Leguna": 10, "Rickshaw": 28 };

  let totalDistance = rawDist * (roadMultiplier[transport] || 1.4);
  if (isDetoured) totalDistance += 2.4;

  let totalMinutes = Math.max(8, Math.round(totalDistance / (speedKmH[transport] || 15) * 60));
  if (isDetoured) totalMinutes += 12;

  let calculatedFare = totalDistance * (baseRateKm[transport] || 10);
  let pricingNote = "";

  // Student discount logic (Part 3)
  let studentFare = Math.max(10, Math.round(totalDistance * 4.5 * 0.5));
  let regularBusFare = Math.max(15, Math.round(totalDistance * 4.5));
  let metroFare = Math.min(100, Math.max(20, Math.round(totalDistance * 6.5)));
  let baseRickshaw = Math.max(30, Math.round(totalDistance * 28));
  let surgeRickshaw = Math.round(baseRickshaw * 1.5);

  if (isStudent) {
    if (transport === "Bus") {
      calculatedFare = studentFare;
      pricingNote = "Student 50% discount applied (minimum ৳10 floor).";
    } else {
      pricingNote = "Student half-fare passes are accepted only on local buses.";
    }
  }

  if (isRainSurge || activeScenario === "rain") {
    if (transport === "Rickshaw" || transport === "Leguna") {
      calculatedFare = Math.round(calculatedFare * 1.5);
      totalMinutes = Math.round(totalMinutes * 1.3);
      pricingNote += (pricingNote ? " " : "") + "Monsoon rain surge (+50%) active for connector rickshaws.";
    } else if (transport === "Bus") {
      totalMinutes = Math.round(totalMinutes * 1.35);
      pricingNote += (pricingNote ? " " : "") + "Waterlogged street delays (+35% travel time).";
    }
  }

  if (activeScenario === "rush") {
    totalMinutes = Math.round(totalMinutes * 1.5);
    pricingNote += (pricingNote ? " " : "") + "Peak evening office rush hour traffic gridlock (+50% travel time).";
  }

  const minFloor = { "Metro": 20, "Bus": isStudent ? 10 : 15, "Leguna": 15, "Rickshaw": 30 };
  const finalFare = Math.max(minFloor[transport] || 15, Math.round(calculatedFare));

  // Render Result Box
  document.getElementById("distance").textContent = totalDistance.toFixed(1) + " km";
  document.getElementById("duration").textContent = totalMinutes + " min";
  document.getElementById("fare").textContent = "৳" + finalFare;

  const detailRow = document.getElementById("fare-detail-row");
  const noteEl = document.getElementById("fare-note");
  if (detailRow && noteEl) {
    if (pricingNote || isDetoured) {
      detailRow.style.display = "flex";
      noteEl.textContent = (isDetoured ? detourText + " " : "") + pricingNote;
    } else {
      detailRow.style.display = "none";
    }
  }

  // Update Comparative Fares Grid (Part 3)
  document.getElementById("comparo-metro").textContent = "৳" + metroFare;
  document.getElementById("comparo-bus").textContent = `৳${regularBusFare} / ৳${studentFare}`;
  document.getElementById("comparo-rickshaw").textContent = `৳${baseRickshaw} (Surge ৳${surgeRickshaw})`;

  // Multi-Leg Route Steps (Part 2)
  const legsContainer = document.getElementById("legs-output");
  if (legsContainer) {
    let leg1Icon = "🛺";
    let leg1Title = `Feeder Leg: Connector Rickshaw from ${origin}`;
    let leg1Landmark = `Board at ${origin} central stand / junction.`;
    let leg1Time = "7 mins · ৳30";

    let leg2Icon = transport === "Metro" ? "🚆" : (transport === "Bus" ? "🚌" : "🚐");
    let leg2Title = `Trunk Transit Leg via ${transport}`;
    let leg2Landmark = isDetoured
      ? `Rerouted via Agargaon Bypass due to Farmgate disruption.`
      : `Board at main ${origin} bus bay or MRT station concourse.`;
    let leg2Time = `${totalMinutes - 12} mins · ৳${finalFare - 30 > 10 ? finalFare - 30 : finalFare}`;

    let leg3Icon = "🚶";
    let leg3Title = `Final Walk to ${destination}`;
    let leg3Landmark = `Alight at ${destination} transit hub, proceed on foot.`;
    let leg3Time = "5 mins · ৳0";

    legsContainer.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: #37534d; text-transform: uppercase; margin-bottom: 4px;">
        Step-by-Step Multi-Leg Journey:
      </div>
      <div class="leg-step">
        <div class="leg-icon">${leg1Icon}</div>
        <div class="leg-details">
          <div class="leg-title"><span>Leg 1: Connector Rickshaw</span><span>${leg1Time}</span></div>
          <div class="leg-note">${leg1Title}</div>
          <span class="leg-landmark">📍 Landmark: ${leg1Landmark}</span>
        </div>
      </div>
      <div class="leg-step">
        <div class="leg-icon">${leg2Icon}</div>
        <div class="leg-details">
          <div class="leg-title"><span>Leg 2: ${transport} Line</span><span>${leg2Time}</span></div>
          <div class="leg-note">${leg2Title}</div>
          <span class="leg-landmark">📍 Landmark: ${leg2Landmark}</span>
        </div>
      </div>
      <div class="leg-step">
        <div class="leg-icon">${leg3Icon}</div>
        <div class="leg-details">
          <div class="leg-title"><span>Leg 3: Walking Arrival</span><span>${leg3Time}</span></div>
          <div class="leg-note">${leg3Title}</div>
          <span class="leg-landmark">📍 Landmark: ${leg3Landmark}</span>
        </div>
      </div>
    `;
  }

  // Draw Polylines on Map
  if (routeLine) map.removeLayer(routeLine);
  routeMarkers.forEach(m => map.removeLayer(m));
  detourMarkers.forEach(m => map.removeLayer(m));
  routeMarkers = [];
  detourMarkers = [];

  const pathPoints = isDetoured ? [start, detourWaypoint, end] : [start, end];

  routeLine = L.polyline(pathPoints, {
    color: isDetoured ? "#e05252" : "#087f70",
    weight: 5,
    opacity: 0.85,
    dashArray: isDetoured ? "8, 6" : "10, 8"
  }).addTo(map);

  const mStart = L.marker(start).addTo(map).bindPopup("<strong>Origin Hub:</strong> " + origin);
  const mEnd = L.marker(end).addTo(map).bindPopup("<strong>Destination Hub:</strong> " + destination);
  routeMarkers.push(mStart, mEnd);

  if (isDetoured && detourWaypoint) {
    const dMarker = L.circleMarker(detourWaypoint, {
      radius: 8,
      color: "#e05252",
      fillColor: "#ffffff",
      fillOpacity: 1,
      weight: 3
    }).addTo(map).bindPopup("<strong>Reroute Waypoint:</strong> Agargaon Bypass");
    detourMarkers.push(dMarker);
  }

  map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

  // Store current briefing for audio readout
  currentRouteBriefing = {
    origin,
    destination,
    transport,
    distance: totalDistance.toFixed(1),
    duration: totalMinutes,
    fare: finalFare,
    isDetoured,
    note: pricingNote
  };

  const resultBox = document.getElementById("route-result");
  if (resultBox) resultBox.style.display = "block";

  showToast(`📍 Route calculated: ${origin} → ${destination} (${transport})`);
}

// 9. Audio Commute Briefing (Bonus Task 2 - Web Speech API)
function playAudioBriefing() {
  if (!('speechSynthesis' in window)) {
    showToast("⚠️ Web Speech API is not supported in this browser.");
    return;
  }

  if (!currentRouteBriefing) {
    showToast("Please calculate a route first before requesting an audio briefing.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any active speech

  const b = currentRouteBriefing;
  let text = `DhakaPath route briefing. From ${b.origin} to ${b.destination} using ${b.transport}. `;
  text += `Total estimated distance is ${b.distance} kilometers. Expected travel time is approximately ${b.duration} minutes. `;
  text += `Estimated fare is ${b.fare} Taka. `;

  if (b.isDetoured) {
    text += `Alert: Route has been detoured via Agargaon due to an active road blockade. `;
  }
  if (b.note) {
    text += `${b.note} `;
  }
  text += `Have a safe journey with DhakaPath.`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = "en-US";

  window.speechSynthesis.speak(utterance);
  showToast("🔊 Playing DhakaPath Audio Route Briefing...");
}

// 10. Copy Route Summary Card for Offline Commuters (Bonus Task 2)
function copyRouteCard() {
  if (!currentRouteBriefing) {
    showToast("Please calculate a journey first.");
    return;
  }
  const b = currentRouteBriefing;
  const text = `📋 DhakaPath Route Summary Card\n` +
    `• From: ${b.origin}\n` +
    `• To: ${b.destination}\n` +
    `• Mode: ${b.transport}\n` +
    `• Distance: ${b.distance} km\n` +
    `• Est Time: ${b.duration} mins\n` +
    `• Est Fare: ৳${b.fare}\n` +
    (b.isDetoured ? `• Status: Rerouted around road blockade\n` : ``) +
    `Generated by DhakaPath · IAIT National IT Fest 2026`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 Route summary copied to clipboard! Ready to save or text.");
  }).catch(() => {
    showToast("Could not access clipboard.");
  });
}

// 11. Commuter Ride-Share & Fare Splitter (Bonus Task 3)
function calculateRideSplit() {
  const hub = document.getElementById("share-hub")?.value || "Farmgate";
  const destination = document.getElementById("share-destination")?.value || "Destination";
  const mode = document.getElementById("share-mode")?.value || "CNG";
  const pax = parseInt(document.getElementById("share-pax")?.value || "3", 10);
  const totalFare = parseFloat(document.getElementById("share-fare")?.value || "180");

  const perPerson = Math.ceil(totalFare / (pax || 1));

  const perPersonEl = document.getElementById("split-per-person");
  const summaryEl = document.getElementById("split-summary-text");

  if (perPersonEl) perPersonEl.textContent = `৳${perPerson}`;
  if (summaryEl) {
    summaryEl.textContent = `${pax} commuters sharing a ${mode} from ${hub.split(' ')[0]} to ${destination}. ৳${perPerson} per person.`;
  }
}

function copyRideShareInvite() {
  const hub = document.getElementById("share-hub")?.value || "Farmgate";
  const destination = document.getElementById("share-destination")?.value || "Dhaka University Campus";
  const mode = document.getElementById("share-mode")?.value || "CNG";
  const pax = document.getElementById("share-pax")?.value || "3";
  const totalFare = document.getElementById("share-fare")?.value || "180";
  const perPerson = Math.ceil(parseFloat(totalFare) / parseInt(pax, 10));

  const text = `🤝 DhakaPath Commuter Ride-Share Invitation\n` +
    `• Pickup Hub: ${hub}\n` +
    `• Destination: ${destination}\n` +
    `• Transport: ${mode} (${pax} passengers)\n` +
    `• Total Fare: ৳${totalFare} (Fair Share: ৳${perPerson}/commuter)\n` +
    `Let's ride together and split costs! Coordinates via DhakaPath.`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 Ride-share invitation copied to clipboard! Share with commuters at your hub.");
  });
}

// 12. Render Transit Network CMS Catalog (Part 1)
function renderTransitCatalog() {
  const catalogContainer = document.getElementById("transit-routes-catalog");
  if (!catalogContainer) return;

  catalogContainer.innerHTML = transitCatalog.map(route => `
    <div class="route-catalog-card">
      <div>
        <div class="route-header">
          <span class="route-mode-badge ${route.class}">${route.mode}</span>
          <span style="font-size: 11px; font-weight: 700; color: #087f70;">${route.fare}</span>
        </div>
        <div class="route-title">${route.title}</div>
        <div class="route-path"><strong>Corridor:</strong> ${route.path}</div>
        <div class="route-meta-tags">
          <span class="route-tag highlight">🎓 Student Pass: ${route.studentHalfPass}</span>
          <span class="route-tag">⏱ ${route.time}</span>
          <span class="route-tag">🚏 ${route.stations} Key Stops</span>
        </div>
      </div>
      <div class="route-landmark-box">
        <strong>📍 Boarding Landmark:</strong> ${route.boarding}
      </div>
    </div>
  `).join("");
}

// 13. Map Initialization & Hub Pins
function initMapAndRoutes() {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") return;

  map = L.map("map").setView([23.7750, 90.3950], 12);
  window.dhakaMap = map;

  // 100% Free, No API Key, No Watermark Tile Layers (Completely unrestricted)
  const osmHumanitarian = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: "abc",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.hotosm.org/">Humanitarian OSM</a>'
  });

  const esriStreets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, USGS'
  });

  const cyclOSM = L.tileLayer("https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png", {
    maxZoom: 18,
    subdomains: "abc",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://github.com/cyclosm/cyclosm-cartocss-style">CyclOSM</a>'
  });

  const esriTopo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ'
  });

  // Default to OpenStreetMap Humanitarian (Clean, official OSM, zero watermarks, zero API key)
  osmHumanitarian.addTo(map);

  // Add interactive Layer Switcher for judges & commuters
  const baseLayers = {
    "OpenStreetMap (Humanitarian)": osmHumanitarian,
    "Esri City Streets": esriStreets,
    "CyclOSM Urban Transit": cyclOSM,
    "Esri Topographic Map": esriTopo
  };
  L.control.layers(baseLayers, null, { position: "topright" }).addTo(map);

  Object.keys(locations).forEach(name => {
    L.circleMarker(locations[name], {
      radius: 6,
      color: "#087f70",
      fillColor: "#ffffff",
      fillOpacity: 1,
      weight: 2.5
    }).addTo(map).bindPopup(`
      <div style="font-family: inherit;">
        <strong style="color: #087f70; font-size: 14px;">${name}</strong>
        <p style="margin: 2px 0 0; font-size: 11px; color: #666;">Major Dhaka Transit Junction</p>
      </div>
    `);
  });

  const searchBtn = document.getElementById("search-route");
  if (searchBtn) {
    searchBtn.addEventListener("click", calculateMultiLegJourney);
  }
}

// 14. Conversational Commute Assistant (English & Banglish NLP)
function toggleChat() {
  const chatWindow = document.getElementById("chat-window");
  if (chatWindow) {
    chatWindow.classList.toggle("hidden");
    if (!chatWindow.classList.contains("hidden")) {
      const input = document.getElementById("chat-input");
      if (input) input.focus();
    }
  }
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  const reply = getAssistantReply(message);
  setTimeout(() => {
    addMessage(reply, "bot");
  }, 250);
}

function addMessage(text, type) {
  const box = document.getElementById("chat-messages");
  if (!box) return;
  const msg = document.createElement("div");
  msg.className = type + "-message";
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

function getAssistantReply(message) {
  const q = message.toLowerCase().replace(/[.,!?]/g, " ");

  const hubsList = Object.keys(locations).map(h => h.toLowerCase());

  // 1. Submit Disruption Report through Chat
  if (/\b(report|waterlogging|roadblock|blocked|jam|construction|pani jome|rast[a-z]* bondho|traffic jam|bhanga|drain)\b/.test(q)) {
    const type =
      /waterlogging|pani jome|water/.test(q) ? "Waterlogging" :
      /roadblock|blocked|bondho/.test(q) ? "Roadblock" :
      /construction|bhanga|drain/.test(q) ? "Construction" : "Traffic jam";

    const foundHub = hubsList.find(h => q.includes(h));
    const locationName = foundHub
      ? Object.keys(locations).find(k => k.toLowerCase() === foundHub)
      : "Farmgate";

    DhakaAlerts.addReport({
      location: locationName,
      type: type,
      description: message
    }, true);

    return `✓ Your ${type.toLowerCase()} report for ${locationName} has been recorded!\n\nIt is now pinned on the Dhaka City Map and added to the Live Street Status feed for other commuters to corroborate.`;
  }

  // 2. Multi-Constraint Route queries
  const found = hubsList.filter(hub => q.includes(hub));
  if (found.length >= 2) {
    const origin = Object.keys(locations).find(k => k.toLowerCase() === found[0]);
    const destination = Object.keys(locations).find(k => k.toLowerCase() === found[1]);

    const isBudget = /cheap|budget|kom taka|student|half fare/.test(q);
    const isFast = /fast|taratari|shiggir|metro/.test(q);

    let res = `Transit recommendations for ${origin} to ${destination}:\n\n`;

    if (isFast || origin.includes("Mirpur") || destination.includes("Motijheel")) {
      res += `1. 🚆 MRT-6 Metro Rail (Fastest option)\n• Time: ~20-25 mins\n• Fare: ৳40 - ৳70\n• Boarding: Concourse gate escalator\n\n`;
    }

    res += `2. 🚌 Local Bus (Budget Option)\n• Fare: ৳20 - ৳30 (Student half-pass: ৳10-15)\n• Time: ~45-60 mins depending on traffic.\n\n`;
    res += `3. 🛺 Connector Rickshaw (Door-to-door)\n• Fare: ৳80 - ৳150 (Surge applies in rain).\n\nCheck the Route Planner above to preview multi-leg steps and listen to an Audio Briefing!`;

    return res;
  }

  if (/fare|cost|cheap|budget|student|half fare|kom taka|bhara/.test(q)) {
    return "💡 Dhaka Transit Fare Rules:\n• Buses: 50% Student discount applies with a ৳10 floor.\n• Metro Rail: ৳20 base up to ৳100 maximum, Rapid Pass gets 10% off.\n• Rickshaws: Unmetered, +50% surge during monsoon waterlogging.";
  }

  if (/traffic|alert|road|waterlogging|jam|obostha|status/.test(q)) {
    return `Currently, there are ${reports.length} active street disruptions logged. You can simulate urban disruptions using the Simulator buttons above the map!`;
  }

  return "DhakaPath AI Assistant at your service! Try asking:\n\n" +
    "• Mirpur 10 theke Farmgate\n" +
    "• Report waterlogging in Dhanmondi\n" +
    "• What is the student bus fare?\n" +
    "• Farmgate rasta kemon?";
}

// 15. Bootstrap Application
document.addEventListener("DOMContentLoaded", () => {
  initMapAndRoutes();
  DhakaAlerts.init();
  renderTransitCatalog();
  calculateRideSplit();
});
