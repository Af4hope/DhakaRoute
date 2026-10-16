# DhakaPath: Live Urban Transit & Route Intelligence
> **Official Solution for IAIT National IT Fest 2026 (INIF) · Smart City Hackathon**  
> *Theme: Smart City | Stack: 100% Free & Open-Source Stack*

---

## 📌 Executive Summary

Navigating Dhaka’s chaotic commute is notoriously difficult. Commuters rely on a fragmented mix of **local buses, the MRT-6 Metro Rail, legunas (human haulers), and feeder rickshaws**. Existing map applications fail because they do not account for:
- Sudden monsoon **waterlogging** and road blockades.
- Unofficial student **half-fare** discounts (50% off buses with a ৳10 floor).
- Weather and peak-hour **surge pricing** on rickshaws and CNGs.
- Fragmented multi-leg transitions and landmark boarding locations.

**DhakaPath** is an intelligent, multi-modal urban transit explorer, dynamic fare calculator, and real-time community street-alert platform tailored specifically for Dhaka, Bangladesh.

---

## 🚀 Key Features

### 1. 🚏 Transit Network & Street-Status CMS (Part 1)
- **Comprehensive Public Transit Catalog**:
  - **MRT-6 Metro Rail**: 16 stations from Uttara North to Motijheel, DMTCL tariff integration, Rapid Pass 10% discount.
  - **Major Bus Franchises**: *Shikor Paribahan* (Mirpur ⇄ Motijheel), *Raida Enterprise* (Uttara ⇄ Jatrabari via Badda), and *Bikolpo Auto Service*.
  - **Leguna Corridors**: Line 4 (Farmgate ⇄ Mohammadpur) and Line 7 (Mirpur 10 ⇄ Agargaon).
  - **Connector Rickshaws**: Feeder links with surge indicators.
- **Transit Metadata**: Mode, origin/destination hubs, travel times, base BDT fares, and specific **landmark boarding instructions** (e.g., *Farmgate Footbridge behind police box*, *Mirpur 10 Roundabout Gate 2*).
- **Admin CMS Moderation Mode**: Toggleable admin mode (`⚙️ Admin CMS`) in the navbar allowing administrators to moderate, verify, or remove crowd-reported disruptions.

### 2. 🗺️ Multi-Constraint & Multi-Leg Journey Search (Part 2)
- **14 Major Dhaka Transit Hubs**:
  *Mirpur 10, Uttara, Agargaon, Mohakhali, Farmgate, Dhanmondi, Science Lab, Mohammadpur, Shahbagh, Malibagh, Banasree, Badda, Motijheel, and Jatrabari.*
- **Step-by-Step Multi-Leg Visualizer**:
  - **Leg 1**: Feeder Rickshaw from origin to nearest transit node with specific boarding landmarks.
  - **Leg 2**: Rapid trunk transit (MRT-6 Metro Rail or express local bus).
  - **Leg 3**: Walking or connector leg to destination.
- **Natural Language Parsing**: Understands queries in English and **Banglish** (e.g., *"Mirpur 10 theke Farmgate cheapest way"*, *"Shahbagh jabo jam chara"*).

### 3. ⚡ Dynamic Fare Estimation & Disruption Rerouting (Part 3)
- **Multi-Modal Comparative Cost Breakdown**:
  - 🚇 **MRT-6 Metro Rail**: Fixed official DMTCL distance tariffs (৳20 - ৳100).
  - 🚌 **Local Bus**: Standard fare vs. **🎓 Student Half-Fare** (50% discount with a ৳10 legal minimum floor).
  - 🛺 **Rickshaw / Leguna**: Base negotiated rates vs. **🌧️ Monsoon Weather Surge** (+50%).
- **Interactive Urban Disruption Simulator (Judge Demo Controls)**:
  - `🌧️ Monsoon Flood (Dhanmondi)`: Simulates street waterlogging, activates rickshaw weather surge, and flags delays.
  - `🚧 Farmgate Blockade`: Triggers intersection closure and **automatically recalculates a real-time detour bypass via Agargaon** (+12 mins, +৳15) drawn in red on the map.
  - `🚗 Peak Evening Gridlock (Mirpur 10)`: Simulates rush-hour delays (+50% travel time) and prioritizes Metro Rail routes.
  - `🔄 Normal Traffic`: Restores baseline transit conditions.

### 4. 🛡️ Report Validation & Crowd Corroboration (Part 4)
- **Anti-Spam Sanity Checks**: Character-count validation, prevention of duplicate spam, and rule-based filtering.
- **Crowd Corroboration**: Commuters can click **👍 Confirm** on any alert to corroborate its status; once confirmed by multiple users, the report upgrades to a verified trust badge (`COMMUNITY VERIFIED`).
- **Decay & Resolution**: Users can click **✓ Mark Cleared** when an obstruction has been resolved.

### 5. 💬 Conversational Commute Assistant (Part 5)
- Floating AI Assistant widget with **English and Banglish NLP intent recognition**.
- Ask for routes, fare comparisons, and road condition inquiries.
- **Direct Disruption Reporting**: Commuters can type *"Report waterlogging in Dhanmondi"* or *"Mirpur 10 e rasta bondho"*; the AI extracts the incident type and hub, pins it to the interactive map, and updates the live alert feed immediately.

### 6. 🎁 Bonus Features
- **🔊 Audio Route Briefing (Bonus Task 2)**:
  Uses the native **Web Speech API** (`SpeechSynthesis`) to synthesize an audio readout of your route, fare, and active disruption warnings.
- **📋 Offline Route Summary Card (Bonus Task 2)**:
  One-click clipboard copy of the journey details for commuters with low battery or poor network connectivity.
- **🤝 Commuter Ride-Share & Fare Split Coordinator (Bonus Task 3)**:
  Commuters at transit hubs (*Farmgate, Science Lab, Mirpur 10, etc.*) can split rickshaws or CNGs, calculate per-person fair shares, and generate copyable coordination invites.
- **🚇 Dedicated Metro Fare Calculator (`fare.html`)**:
  Full 16-station interactive fare matrix with single journey and Rapid Pass 10% discount calculations.

---

## 🛠️ 100% Free & Open-Source Stack

In compliance with the hackathon's fair-use constraints (zero paid APIs, no Google Maps API keys):

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, Vanilla CSS3 | Lightweight, fast loading, zero external framework bloat. |
| **Interactive Map** | Leaflet.js | Open-source mapping library. |
| **Map Tile Providers** | OpenStreetMap (Humanitarian HOT), Esri World Street Map, CyclOSM | Free, high-reliability tile servers with no API keys, no 403 blocks, and no watermarks. Includes a top-right Layer Switcher. |
| **Audio Synthesis** | Browser-Native Web Speech API | 100% free speech synthesis with no third-party cloud audio dependencies. |
| **Backend & Realtime** | Node.js, Express, Socket.IO | Real-time multi-device synchronization for crowd alerts. |
| **Offline Fallback** | `localStorage` API | Works reliably without an internet connection or server process. |

---

## 📂 Project Structure

```text
Dhaka Path/
│
├── main.html          # Core web application (Dashboard, Map, Planner, Alerts, CMS, Ride-Share)
├── style.css          # Modern responsive stylesheet (Design system, animations, badges)
├── java.js            # Unified application controller (Map, multi-leg engine, NLP, alerts)
├── fare.html          # Standalone MRT Line-6 Metro Fare Calculator page
├── server.js          # Express & Socket.IO server for live multi-device broadcasting
├── package.json       # Node.js project manifest and dependencies
├── dhk.py             # CLI transit fare calculation utility script
└── README.md          # Comprehensive documentation & setup instructions
```

---

## 💻 Installation & How to Run

### Option A: Standalone / Offline Mode (Instant)
No setup required! Simply double-click **`main.html`** or open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.  
All features—including the Route Planner, Leaflet Map, Scenario Simulator, Audio Briefing, and AI Assistant—run in standalone offline mode using `localStorage`.

### Option B: Live Multi-Device Sync Mode (Node.js & Socket.IO)
To test real-time WebSocket alert broadcasting across multiple browser windows or devices:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local server**:
   ```bash
   npm start
   # or: node server.js
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`. Open the URL in two side-by-side tabs; submitting an alert in one tab will immediately broadcast to the other tab in real time!

---

## 🎙️ 4–5 Minute Presentation & Demo Walkthrough

1. **Introduction (30s)**:
   - Introduce **DhakaPath** as a hyper-localized transit intelligence platform tailored to Dhaka’s daily commute reality.
2. **Transit Network CMS (1m)**:
   - Scroll to **Dhaka Transit Routes & Lines**. Show how Metro, Bus, Leguna, and Rickshaw routes are cataloged with student discount rules and specific landmark boarding notes.
   - Toggle **`⚙️ Admin CMS`** to show moderation capability.
3. **Multi-Constraint Trip Planner (1m)**:
   - Select *Farmgate* to *Motijheel*. Check **🎓 Student Half-Fare**.
   - Click **Find my route →**: showcase the comparative fare breakdown (Metro vs Student Bus vs Rickshaw) and the multi-leg step cards.
   - Click **🔊 Audio Briefing** to demonstrate the native voice readout.
4. **Interactive Disruption Simulation & Rerouting (1.5m)**:
   - Click **`🚧 Farmgate Intersection Blockade`** on the simulation bar.
   - Watch the map immediately flag the blockade in red and **dynamically render an Agargaon bypass detour polyline** with updated time and cost calculations.
5. **AI Assistant & Ride-Share Splitter (1m)**:
   - Open **💬 DhakaPath AI** and enter: *"Report waterlogging in Mirpur 10"*. Show how it automatically pins to the city map and live alerts feed.
   - Show the **🤝 Ride-Share Coordinator** calculating per-person fair shares for commuters sharing a CNG.

---

## 👥 Contributors
Developed for **IAIT National IT Fest 2026 (INIF) · Smart City Hackathon**.
- Map Data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, [Humanitarian OSM Team](https://www.hotosm.org/), and Esri.
