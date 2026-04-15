<div align="center">

<br/>

```
  ███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗██╗   ██╗ ██████╗ ████████╗███████╗
  ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝██║   ██║██╔═══██╗╚══██╔══╝██╔════╝
  ███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗  ██║   ██║██║   ██║   ██║   █████╗  
  ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║   ██║   ██╔══╝  
  ███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗ ╚████╔╝ ╚██████╔╝   ██║   ███████╗
  ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝    ╚═╝   ╚══════╝
```

### **Enterprise-Grade Biometric Election Platform**
*Built with zero-dependency Web APIs · Cryptographically secured · Instantly deployable*

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://tc39.es/)
[![Web Crypto API](https://img.shields.io/badge/Web%20Crypto-SHA--256-00C851?style=for-the-badge&logo=letsencrypt&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github)](CONTRIBUTING.md)
[![No Build Step](https://img.shields.io/badge/Build%20Step-None-blueviolet?style=for-the-badge&logo=lightning)](.)
[![Zero Dependencies](https://img.shields.io/badge/npm%20deps-0-success?style=for-the-badge&logo=npm)](package.json)

<br/>

[**🔴 Live Demo**](#-quick-start) · [**📋 Feature Breakdown**](#-features) · [**🏗️ Architecture**](#%EF%B8%8F-system-architecture) · [**🔐 Security Model**](#-security-model) · [**🚀 Deploy in 60s**](#-deployment)

<br/>

> _"Secure elections are the foundation of democracy. This project proves enterprise-grade security architecture doesn't require a $10M backend — just the right engineering decisions."_

</div>

---

## 📸 Screenshots

| 🏠 Landing Page | 🗳️ Voting Booth | 📊 Live Results | ⚙️ Admin Panel |
|:---:|:---:|:---:|:---:|
| Cinematic hero with 3D tilt cards | 4-stage biometric flow + confidence bar | Race bars + 3 switchable chart types | 7-tab control center with KPIs |

---

## ✨ Features

<details open>
<summary><b>🔐 Security & Authentication</b></summary>

| Feature | Implementation |
|---|---|
| **SHA-256 Biometric Hashing** | `SubtleCrypto.digest()` — fingerprints **never** stored in plaintext |
| **Double-Vote Prevention** | Triple-layer enforcement: identity check → scan → atomic write guard |
| **Election State Machine** | Strict `setup → reg_open → active → ended` — no out-of-order operations |
| **Fraud Detection Engine** | Auto-flags 6 threat types with severity levels (CRITICAL / HIGH / MEDIUM / LOW) |
| **Admin-Gated Approval** | Voters are locked out until an administrator explicitly approves registration |
| **Audit Trail** | Immutable activity log with voter IDs, timestamps, and action types |

</details>

<details open>
<summary><b>🗳️ Voting Experience</b></summary>

- **4-Stage Secure Voting Flow**: Identity Verification → Biometric Scan → Candidate Selection → Confirmation
- Animated **biometric confidence score** with real-time scan simulation (88–99%)
- **Ballot paper animation** flies into a ballot box on submission
- **Confetti celebration** on successful vote cast
- **Print-ready voting receipt** with unique receipt ID, timestamp, and masked voter metadata

</details>

<details open>
<summary><b>📋 Voter Registration (5-Step Wizard)</b></summary>

- Step 1: Personal details with 195-country selector
- Step 2: Drag-and-drop ID proof upload with live image preview
- Step 3: Fingerprint capture simulation + SHA-256 hash generation
- Step 4: Real-time duplicate check on National ID **and** biometric hash
- Step 5: Animated terminal-style verification log + QR code generation
- Persistent **top progress bar** tracking step completion at all times

</details>

<details open>
<summary><b>📊 Live Results Dashboard</b></summary>

- **Race-style animated bars** — candidate standings re-animate on every data refresh
- **3 switchable chart types**: Bar Chart, Area Chart (vote timeline), Radar Chart
- **Scrolling live vote ticker** — recent votes stream in real-time across the screen
- **Animated data pipeline** visualization showing votes flowing through the system
- **Winner announcement banner** with glow effect triggered when election concludes
- **JSON export** of full election dataset for external analysis
- Auto-refreshes every **10 seconds** without page reload

</details>

<details open>
<summary><b>⚙️ Admin Panel (7 Tabs)</b></summary>

| Tab | Capabilities |
|---|---|
| **Dashboard** | KPI cards with ↑↓ delta arrows, animated tally bars, live activity feed |
| **Voter Management** | Pending queue, bulk approve/reject with checkbox selection, full voter registry |
| **Candidates** | Full CRUD — name, party, symbol, color picker, platform statement |
| **Election Control** | Lifecycle state machine UI — advance/revert election phases |
| **Live Monitor** | Real-time vote feed with per-candidate progress bars (3s polling) |
| **Fraud & Alerts** | Filterable severity log, full audit trail with timestamps and voter IDs |
| **Results & Export** | Final ranked standings table + one-click JSON download |

</details>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SecureVote Platform                          │
│                                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌─────────────┐ │
│  │ index.html│   │register.html │   │ vote.html│   │results.html │ │
│  │  Landing  │   │  5-Step Reg  │   │ 4-Stage  │   │  Dashboard  │ │
│  └─────┬────┘   └──────┬───────┘   └────┬─────┘   └──────┬──────┘ │
│        │               │                │                 │        │
│  ┌─────▼───────────────▼────────────────▼─────────────────▼──────┐ │
│  │                      Core Layer (app.js)                       │ │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │  StorageManager  │  │ ElectionState│  │   CryptoUtils    │  │ │
│  │  │  (localStorage)  │  │ (FSM Engine) │  │  (SHA-256 Hash)  │  │ │
│  │  └─────────────────┘  └──────────────┘  └──────────────────┘  │ │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │  FraudDetector   │  │  AuditLogger │  │  EventBus (pub)  │  │ │
│  │  └─────────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Presentation Layer                         │  │
│  │  css/global.css · css/components.css · css/scanner.css       │  │
│  │  Design tokens · Glass morphism · Custom animations          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
Finger_print_Voting_system/
│
├── 📄 index.html           # Cinematic landing page with 3D tilt cards
├── 📄 register.html        # 5-step voter registration wizard
├── 📄 vote.html            # 4-stage secure biometric voting booth
├── 📄 results.html         # Live results dashboard with 3 chart modes
├── 📄 admin.html           # 7-tab election administration panel
│
├── 📁 css/
│   ├── global.css          # Design tokens, typography, layout, keyframe animations
│   ├── components.css      # Cards, buttons, forms, modals, tables, alerts
│   └── scanner.css         # Fingerprint scanner canvas + glow animations
│
└── 📁 js/
    ├── app.js              # Core: StorageManager, ElectionState, CryptoUtils, Utils
    ├── scanner.js          # FingerprintScanner class — canvas-based biometric sim
    ├── register.js         # Registration wizard logic (5 steps + validation)
    ├── vote.js             # Voting flow + ballot animation + confetti engine
    ├── results.js          # Chart.js integration + race bars + live ticker
    └── admin.js            # Admin panel tabs + bulk actions + KPI trend engine
```

### Data Schema

```javascript
// All data persisted to localStorage under the `fpvs_` prefix namespace

StorageManager {
  voters: Voter[]       // { id, name, dob, nationalId, country, biometricHash,
                        //   status: 'pending'|'approved'|'rejected',
                        //   voterId, hasVoted, registeredAt }

  candidates: Candidate[] // { id, name, party, symbol, color, platform, votes }

  election: Election    // { state: ElectionState, title, description,
                        //   startedAt, endedAt, createdAt }

  votes: Vote[]         // { voterId, candidateId, receipt, timestamp }

  fraudAlerts: Alert[]  // { type, severity, details, voterId, timestamp }

  activityLog: Log[]    // { action, details, userId, timestamp }
}
```

---

## 🔐 Security Model

### Biometric Hash Generation

```
┌───────────────────────────────────────────────────────────────┐
│                    Registration Flow                          │
│                                                               │
│  User Input:  [ name ] + [ dob ] + [ nationalId ] + [ seed ] │
│                              │                                │
│                    TextEncoder.encode()                       │
│                              │                                │
│              SubtleCrypto.digest('SHA-256', buffer)           │
│                              │                                │
│                   biometricHash (hex, 64 chars)               │
│                              │                                │
│  ✅ Stored only the HASH — raw inputs are never persisted      │
└───────────────────────────────────────────────────────────────┘
```

### Voting Authorization Pipeline

```
Vote Attempt
    │
    ▼
[1] Voter ID exists in registry?          ──✗──▶ INVALID_VOTER_ID alert
    │✓
    ▼
[2] Voter status === 'approved'?          ──✗──▶ VOTER_NOT_APPROVED alert
    │✓
    ▼
[3] voter.hasVoted === false?             ──✗──▶ ALREADY_VOTED alert
    │✓
    ▼
[4] Election state === 'election_active'? ──✗──▶ ELECTION_NOT_ACTIVE alert
    │✓
    ▼
[5] Biometric scan passes comparison?     ──✗──▶ SCAN_FAILED counter++
    │✓                                           (3 failures → CRITICAL alert)
    ▼
[6] Atomic write guard (re-check hasVoted)──✗──▶ Race condition blocked
    │✓
    ▼
Vote recorded + Receipt generated ✅
```

---

## 🚨 Fraud Detection System

The engine automatically detects and logs the following threats:

| Threat Code | Severity | Trigger Condition |
|---|:---:|---|
| `INVALID_VOTER_ID` | 🔴 HIGH | Voter ID not found in registry |
| `VOTER_NOT_APPROVED` | 🟡 MEDIUM | Pending/rejected voter attempts to vote |
| `ALREADY_VOTED` | 🔴 CRITICAL | Duplicate vote attempt on same voter ID |
| `SCAN_FAILED` | 🔴 CRITICAL | 3+ consecutive failed biometric scans |
| `ELECTION_NOT_ACTIVE` | 🟡 MEDIUM | Vote attempt outside active election window |
| `REGISTRATION_DUPLICATE` | 🔴 HIGH | Duplicate National ID **or** biometric hash |

Every alert is stored with: `{ type, severity, voterId, details, ip, timestamp }` for post-election forensic auditing.

---

## 🛠️ Tech Stack

| Technology | Role | Why Chosen |
|---|---|---|
| **Vanilla HTML5** | Structure | Semantic, accessible, zero overhead |
| **Vanilla CSS3** | Styling | Full control — design tokens, glassmorphism, keyframes |
| **Vanilla JS (ES2024)** | Logic | No transpilation, runs natively in every modern browser |
| **Web Crypto API** | SHA-256 hashing | Native async crypto — no library needed |
| **localStorage** | Data persistence | Zero server cost, instantly portable |
| **Chart.js 4.4** | Data visualization | Bar, Area, Radar, Donut charts via CDN |
| **canvas-confetti** | UX celebration | Lightweight confetti for vote submission |
| **QRCode.js** | QR generation | Voter ID QR code on registration completion |
| **Canvas 2D API** | Fingerprint animation | Custom scanner renderer — no canvas library |

> **Philosophy**: Every dependency is a CDN link. The build step is `none`. Total JS payload from npm: **0 bytes**.

---

## 🚀 Quick Start

### Option 1 — Open directly (zero setup)

```bash
# Clone the repo
git clone https://github.com/your-username/Finger_print_Voting_system.git
cd Finger_print_Voting_system

# Open in browser — no server needed
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

### Option 2 — Local dev server (recommended for full feature parity)

```bash
# Using npx serve
npx serve . --listen 8080
# → http://localhost:8080

# OR using Python
python -m http.server 8080
# → http://localhost:8080

# OR one-click with included launcher (Windows)
./launch.bat
```

### Option 3 — One-click cloud deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire project folder onto the drop zone
3. ✅ Live URL generated in under 10 seconds

---

## 🎮 End-to-End Demo Walkthrough

Follow these steps to experience the complete election lifecycle from setup to results:

```
Step 1  ─  Open admin.html         Default password: admin123
Step 2  ─  Add candidates          Candidates tab → "+ Add Candidate" (add 3+)
Step 3  ─  Open registration       Election Control → "Open Voter Registration"
Step 4  ─  Register a voter        Open register.html → complete all 5 steps
Step 5  ─  Approve the voter       Admin → Voter Management → Approve ✅
Step 6  ─  Start the election      Admin → Election Control → "Start Election"
Step 7  ─  Cast a vote             vote.html → enter Country + Voter ID from Step 4
Step 8  ─  Watch live results      Open results.html → see race bars animate
Step 9  ─  End the election        Admin → Election Control → "End Election"
Step 10 ─  See the winner          results.html displays winner banner with glow ✨
```

---

## 🔑 Engineering Decisions

<details>
<summary><b>Why no backend or database?</b></summary>

Intentional architecture choice. This project demonstrates that **client-side engineering** can implement complex application patterns — state machines, cryptographic security, fraud detection, real-time dashboards — with zero infrastructure cost. All state lives in `localStorage` under the `fpvs_` namespace prefix.

**Trade-off acknowledged**: localStorage is not persistent across devices or incognito sessions. For a production system, you'd swap `StorageManager` for an API client — the rest of the codebase remains unchanged.

</details>

<details>
<summary><b>Why simulate biometrics instead of using real hardware?</b></summary>

The Web Platform Security Model deliberately prevents JavaScript from accessing raw biometric sensors (fingerprint readers, cameras for facial recognition) without explicit OS-level APIs. The `FingerprintScanner` class simulates enrollment by capturing a user-specific seed token and running it through `SubtleCrypto.digest()` — producing a **deterministic, collision-resistant 256-bit hash** tied to voter identity. This accurately models real AFIS (Automated Fingerprint Identification System) behavior.

</details>

<details>
<summary><b>Why a strict election state machine?</b></summary>

Without a formal FSM, any component can call any function at any time — leading to impossible states like "a vote cast before the election started." The `ElectionState` module enforces a strict directed acyclic transition graph:

```
setup ──▶ registration_open ──▶ election_active ──▶ election_ended
```

State transitions are validated atomically. Attempts to advance to a non-adjacent state are rejected and logged. This is the same pattern used by AWS Step Functions and Apache Airflow DAGs.

</details>

<details>
<summary><b>Why triple-layer double-vote prevention?</b></summary>

A single check introduces a **TOCTOU (Time-of-Check-to-Time-of-Use) race condition** in scenarios with multiple browser tabs. Three independent guards close all attack surfaces:

1. **Pre-scan check** — rejects the attempt before any computation  
2. **Post-scan check** — validates state hasn't changed during the bio scan animation  
3. **Atomic write guard** — final re-read before the vote is committed to storage

</details>

---

## 📁 Codebase Metrics

| File | Size | Responsibility |
|---|---|---|
| `js/app.js` | 23 KB | Core engine — storage, state, crypto, fraud |
| `js/admin.js` | 27 KB | Admin panel — 7 tabs, KPIs, bulk actions |
| `js/results.js` | 17 KB | Charts, race bars, live ticker, polling |
| `js/vote.js` | 16 KB | Voting flow, ballot animation, confetti |
| `js/register.js` | 17 KB | 5-step wizard, validation, QR generation |
| `js/scanner.js` | 12 KB | Canvas-based fingerprint scanner |
| `css/global.css` | 21 KB | Design tokens, layout, keyframes |
| `css/components.css` | 21 KB | All UI components |
| `css/scanner.css` | 8 KB | Scanner-specific animations |
| **Total** | **~162 KB** | **Zero build step · Zero npm packages** |

---

## 🤝 Contributing

Contributions are warmly welcomed. Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** with conventional commits: `git commit -m "feat: add multi-language support"`
4. **Push** to your fork: `git push origin feat/your-feature-name`
5. **Open** a Pull Request with a clear description of your changes

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, no logic changes
refactor: Code restructure without feature change
perf:     Performance improvement
test:     Adding or updating tests
```

### Ideas for Contribution

- [ ] Persistent backend (Supabase / Firebase integration)
- [ ] Multi-language (i18n) support
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Dark/Light theme toggle
- [ ] Mobile-first responsive overhaul
- [ ] End-to-end Playwright test suite

---

## 📜 License

```
MIT License

Copyright (c) 2026 SecureVote Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙋 About This Project

**SecureVote** is a portfolio-grade project demonstrating that production-quality software architecture — cryptographic security, FSM-driven state management, real-time data visualization, and fraud detection systems — is achievable with **zero external runtime dependencies** and **zero build tooling**.

Key skills demonstrated:
- 🔐 Security-first architecture with Web Crypto API
- 🏛️ Finite State Machine design pattern
- 📊 Real-time data visualization with Chart.js
- 🖥️ Complex multi-page SPA-like flows in vanilla JS
- 🎨 CSS design systems (tokens, BEM-adjacent naming, custom keyframes)
- 🛡️ Fraud detection and immutable audit logging

---

<div align="center">

<br/>

**If this project helped you or impressed you, consider giving it a ⭐**

[![GitHub stars](https://img.shields.io/github/stars/your-username/Finger_print_Voting_system?style=for-the-badge&logo=github&color=gold)](https://github.com/your-username/Finger_print_Voting_system/stargazers)

<br/>

*Built with obsessive attention to detail · Powered by the Open Web Platform*

<br/>

`SHA-256` · `Canvas API` · `Web Crypto` · `Chart.js` · `Zero Dependencies` · `Zero Build Step`

</div>
