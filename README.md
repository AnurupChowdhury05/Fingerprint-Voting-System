# 🖐️ SecureVote — Advanced Biometric Fingerprint Voting System

<div align="center">

![SecureVote Banner](https://img.shields.io/badge/SecureVote-Biometric%20Election%20Platform-00d4ff?style=for-the-badge&logo=fingerprint&logoColor=white)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Web Crypto API](https://img.shields.io/badge/Web%20Crypto-SHA--256-00ff88?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A state-of-the-art, browser-based biometric voting simulation featuring fingerprint authentication, real-time results, fraud detection, and a full election lifecycle management system.**

[🔴 Live Demo](#) · [📋 Features](#-features) · [🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#️-architecture)

</div>

---

## 📸 Preview

| Landing Page | Voting Booth | Live Results |
|---|---|---|
| Cinematic hero, 3D tilt cards | Biometric scan + confidence bar | Race bars, 3 chart types |

---

## ✨ Features

### 🔐 Security
- **SHA-256 Biometric Hashing** via Web Crypto API — fingerprints never stored in plain text
- **Double-vote prevention** — enforced at identity check, scan, and final submission
- **Election lifecycle state machine** — voters cannot vote outside an active election
- **Fraud detection & audit log** — every suspicious action is recorded with type, severity, and timestamp
- **Admin-gated approval** — voters cannot vote until an administrator approves their registration

### 🗳️ Voting Experience
- 4-stage secure voting flow: Identity → Biometric Scan → Candidate Select → Confirm
- Animated **biometric confidence score** (88–99% simulation)
- **Ballot paper animation** on vote submission
- **Confetti celebration** on successful vote
- **Print-ready voting receipt** with receipt ID and timestamp

### 📋 Voter Registration (5-Step Flow)
- Personal details + country selection (195 countries)
- **Drag-and-drop ID proof upload** with image preview
- **Fingerprint capture simulation** with SHA-256 hash generation
- **Real-time duplicate check** — National ID + biometric hash
- **Animated terminal-style verification log**
- **QR code** generated on registration submission
- **Top progress bar** tracks step completion

### 📊 Live Results Dashboard
- **Race-style animated bars** — candidate standings animate on every refresh
- **3 switchable chart types**: Bar Chart, Area Chart (timeline), Radar Chart
- **Scrolling live vote ticker** — recent votes stream across the screen
- **Animated data pipeline** visualization
- **Winner announcement banner** with glow effect when election ends
- **JSON export** for election data
- Auto-refreshes every 10 seconds

### ⚙️ Admin Panel (7 Tabs)
| Tab | Features |
|---|---|
| **Dashboard** | KPI cards with ↑↓ trend arrows, animated tally bars, activity log |
| **Voter Management** | Pending queue, **bulk approve/reject** with checkboxes, voter table |
| **Candidates** | Full CRUD with color picker, symbol, party, platform |
| **Election Control** | Lifecycle state machine (Setup → Reg Open → Active → Ended) |
| **Live Monitor** | Real-time vote feed, per-candidate progress bars (3s polling) |
| **Fraud & Alerts** | Filterable severity log, audit trail with voter IDs |
| **Results & Export** | Ranked standings, JSON download |

---

## 🏗️ Architecture

```
Finger_print_Voting_system/
│
├── index.html          # Cinematic landing page
├── register.html       # 5-step voter registration
├── vote.html           # 4-stage secure voting booth
├── results.html        # Live results dashboard
├── admin.html          # 7-tab admin panel
│
├── css/
│   ├── global.css      # Design tokens, typography, layout, animations
│   ├── components.css  # Cards, buttons, forms, modals, tables, alerts
│   └── scanner.css     # Fingerprint scanner canvas + animations
│
└── js/
    ├── app.js          # Core: StorageManager, ElectionState, CryptoUtils, Utils
    ├── scanner.js      # FingerprintScanner class (canvas-based simulation)
    ├── register.js     # Registration flow logic
    ├── vote.js         # Voting flow logic + ballot animation + confetti
    ├── results.js      # Chart.js integration + race bars + ticker
    └── admin.js        # Admin panel tabs + bulk actions + KPI trends
```

### Data Flow

```
User Action
    │
    ▼
StorageManager (localStorage)
    │
    ├── Voters[]          { id, name, nationalId, biometricHash, status, voterId, hasVoted }
    ├── Candidates[]      { id, name, party, symbol, color, votes }
    ├── Election{}        { state, title, timestamps }
    ├── Votes[]           { voterId, candidateId, receipt, timestamp }
    ├── FraudAlerts[]     { type, severity, details, timestamp }
    └── ActivityLog[]     { action, details, timestamp }
```

### Security Model

```
Registration:
  SHA-256( name + dob + nationalId + scanToken ) → biometricHash (stored)

Voting:
  1. Voter ID lookup → must exist + approved + not voted
  2. Simulated fingerprint scan → hash comparison
  3. Final guard check (race condition prevention)
  4. Vote recorded atomically
```

---

## 🚀 Quick Start

### Option 1: Open directly (no server needed)
```bash
# Just open index.html in your browser
# Chrome / Edge / Firefox — all supported
```

### Option 2: Local server (recommended)
```bash
npx serve . --listen 8080
# Open http://localhost:8080
```

### Option 3: Deploy to Netlify
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire project folder onto the page
3. Done — live URL in seconds

---

## 🎮 Demo Walkthrough

```
1. Open admin.html         → password: admin123
2. Add 3 candidates        → Candidates tab → + Add Candidate
3. Open registration       → Election Control → "Open Voter Registration"
4. Register a voter        → Open register.html → complete 5 steps
5. Approve the voter       → Admin → Voters tab → Approve
6. Start election          → Admin → Election Control → "Start Election"
7. Cast a vote             → Open vote.html → use country + Voter ID from step 5
8. Watch results live      → Open results.html
9. End election            → Admin → Election Control → "End Election"
10. See winner banner      → results.html shows the winner
```

---

## 🛡️ Fraud Detection

The system automatically logs and flags:

| Fraud Type | Trigger |
|---|---|
| `INVALID_VOTER_ID` | Voter ID not found in registry |
| `VOTER_NOT_APPROVED` | Pending/rejected voter attempts to vote |
| `ALREADY_VOTED` | Double-vote attempt detected |
| `SCAN_FAILED` | 3+ consecutive failed fingerprint scans |
| `ELECTION_NOT_ACTIVE` | Vote attempt outside election window |
| `REGISTRATION_DUPLICATE` | Duplicate National ID or biometric hash |

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **Vanilla HTML/CSS/JS** | Core application — zero build step |
| **Web Crypto API** | SHA-256 fingerprint hashing |
| **localStorage** | All data persistence (client-side) |
| **Chart.js 4.4** | Bar, Area, Radar, Donut charts |
| **canvas-confetti** | Vote success celebration |
| **QRCode.js** | Voter ID QR generation |
| **Canvas 2D API** | Fingerprint scanner animation |

---

## 🔑 Key Design Decisions

- **No backend / No database** — intentional. Keeps it self-contained and instantly deployable. All state lives in `localStorage` under the `fpvs_` prefix.
- **Biometric simulation** — real fingerprint hardware isn't accessible in browsers. The scanner simulates enrollment by capturing a seed and generating a deterministic SHA-256 hash tied to voter identity.
- **Election state machine** — strict `setup → registration_open → election_active → election_ended` lifecycle prevents out-of-order operations (e.g., voting before election starts).
- **Fraud audit trail** — every security-relevant action is logged with type, severity (critical/high/medium/low), IP, and timestamp for post-election auditing.

---

## 📜 License

MIT License — free to use, modify, and distribute.

---

## 🙋 Author

Built as a portfolio project demonstrating:
- Complex UI/UX with pure HTML/CSS/JS
- Security-first design with cryptographic hashing
- Real-time data visualization
- State machine architecture
- FAANG-level code organization and polish

---

<div align="center">
  Made with ❤️ and lots of ☕
  <br><br>
  <i>Star ⭐ this repo if you found it useful!</i>
</div>
