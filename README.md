# 🛰️ Orbital Command — Real-Time Satellite Tracker

A production-quality 3D satellite tracking and orbit visualization platform built with React, Three.js, and satellite.js.

---

## ✨ Features

### 3D Earth Visualization
- Procedural Earth texture with ocean and land differentiation
- Cloud layer with independent rotation
- Multi-layer atmospheric glow (inner + outer)
- Latitude/longitude coordinate grid with toggle
- Real-time Earth rotation synchronized to simulation clock

### Satellite Orbital Mechanics
- Full Keplerian orbital propagator using **satellite.js** (SGP4/SDP4)
- Accurate orbit path rendering for each satellite
- Real-time position updates tied to simulation time
- Velocity vector visualization for selected satellite

### Orbit Types Supported
| Type | Altitude Range |
|------|---------------|
| LEO  | < 2,000 km    |
| MEO  | 2,000–35,786 km |
| GEO  | ~35,786 km    |
| HEO  | > 35,786 km   |

### Real Satellite Data
- Built-in sample TLE set (ISS, Starlink, GPS, NOAA, Hubble, Sentinel, Landsat…)
- Live TLE fetch from **CelesTrak** via the "LIVE TLE" button
- Categories: ISS · Starlink · GPS · Weather · Science · Communication

### Interactive UI
- Drag to rotate globe · Scroll to zoom · Click satellite to inspect
- Sidebar with search + category filters
- Right-panel telemetry: altitude, velocity, lat/lon, inclination, period, RAAN…
- Orbit type badge (LEO / MEO / GEO)

### Time Simulation
- Play / Pause / Reverse / Reset
- Speed steps: 0.1× · 0.5× · 1× · 10× · 100× · 500× · 1000×
- Live UTC clock display in Day-Of-Year format

### Layer Toggles
- Orbit trails · Grid · Atmosphere · Stars · Labels · Ground Tracks · Velocity Vectors · Auto-Rotate

### Notifications
- Toast system for satellite selection, TLE load status, alerts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install

```bash
cd satellite-tracker-pro
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
satellite-tracker-pro/
├── public/
│   └── satellite.svg          # Favicon
├── src/
│   ├── components/
│   │   ├── Scene.jsx          # Three.js / R3F canvas
│   │   ├── Earth.jsx          # 3D Earth with grid + atmosphere
│   │   ├── Satellites.jsx     # All satellite meshes + orbit lines
│   │   ├── Sidebar.jsx        # Search, filter, satellite list
│   │   ├── InfoPanel.jsx      # Right-side telemetry panel
│   │   ├── TimeControls.jsx   # Play/pause/speed bottom toolbar
│   │   ├── LayerControls.jsx  # Visual layer toggles
│   │   ├── TopBar.jsx         # App header + TLE refresh
│   │   ├── Notifications.jsx  # Toast notification system
│   │   └── StarfieldBackground.jsx  # Canvas star field
│   ├── services/
│   │   └── tleService.js      # CelesTrak TLE fetch + sample data
│   ├── store/
│   │   └── useStore.js        # Zustand global state
│   ├── utils/
│   │   └── satellite.js       # SGP4 propagation helpers
│   ├── App.jsx                # Root component + time loop
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind + custom CSS
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔌 Live TLE Data

Click **LIVE TLE** in the top bar to fetch real satellite positions from CelesTrak.

> **Note:** CelesTrak requests may be blocked by browser CORS policy when running locally. For production, proxy the request through a small backend or serverless function:
>
> ```js
> // Example Cloudflare Worker proxy
> export default {
>   fetch: (req) => fetch(`https://celestrak.org/NORAD/elements/gp.php?${new URL(req.url).searchParams}`)
> }
> ```

---

## 🛠 Tech Stack

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool |
| Three.js | 3D WebGL rendering |
| @react-three/fiber | React renderer for Three.js |
| @react-three/drei | Three.js helpers (OrbitControls, Stars) |
| satellite.js | SGP4/SDP4 orbital mechanics |
| Zustand | Global state management |
| Framer Motion | Animations and transitions |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon set |

---

## 🌍 Deployment

### Vercel / Netlify (Static)

```bash
npm run build
# Upload `dist/` folder
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 📡 Extending the Platform

### Add more satellites
Edit `src/services/tleService.js` → `SAMPLE_TLE_DATA` array.

### Add collision detection
Use `checkCollision()` from `src/utils/satellite.js` and call it from the time loop in `App.jsx`.

### Add a 2D ground track map
Render `getGroundTrack()` output on an `<svg>` or Leaflet.js map overlay.

### Add N2YO API integration
Replace `loadTLEData` in `tleService.js` with N2YO API calls using your API key.

---

## 📜 License

MIT — free for personal and commercial use.
