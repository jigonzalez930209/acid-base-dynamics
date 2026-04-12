# Acid Base Dynamics

[![Deploy to GitHub Pages](https://github.com/jigonzalez930209/acid-base-dynamics/actions/workflows/deploy.yml/badge.svg)](https://github.com/jigonzalez930209/acid-base-dynamics/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Live demo → [jigonzalez930209.github.io/acid-base-dynamics](https://jigonzalez930209.github.io/acid-base-dynamics/)**

An interactive, browser-only platform for exploring acid–base equilibria, speciation, and titration curves. Built with Vite, React 19, and shadcn/ui.

---

## Features

| Feature | Details |
|---|---|
| **Speciation charts** | Mole-fraction α curves vs pH for up to 3 simultaneous acid systems |
| **Titration curves** | pH vs added-volume curves computed from generalised α fractions |
| **Concentration sliders** | Set analyte (CA) and titrant (CB) independently from 0.01 M to 2 M |
| **Equivalence-point table** | Hover-linked table showing the slope-change point (pKa and mL) for each system |
| **Equilibrium viewer** | Step-by-step dissociation equations in structural or symbolic format |
| **Math model panel** | Full descriptive equation system (denominators, α fractions, average charge, titration formula) |
| **Bilingual** | Full Spanish / English UI via react-i18next |
| **Light / dark theme** | System-aware default with manual toggle |
| **50+ acid database** | Monoprotic, diprotic, and triprotic acids from peer-reviewed tables |

---

## Tech Stack

- **Vite 8** – build tooling
- **React 19** – UI runtime
- **TypeScript** – full type safety
- **Tailwind CSS v4** – styling
- **shadcn/ui** – accessible component library
- **KaTeX** – rendered math equations
- **react-i18next** – internationalisation
- **Lucide React** – icons

---

## Getting Started

### Prerequisites

- Node.js ≥ 22
- [pnpm](https://pnpm.io/) ≥ 9

### Install & run

```bash
git clone https://github.com/jigonzalez930209/acid-base-dynamics.git
cd acid-base-dynamics
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
pnpm build
```

The output is in `dist/`. Deploy it to any static host.

---

## Chemistry Model

The engine implements **generalised α-fraction analysis**:

$$\alpha_i = \frac{\prod_{j=0}^{i-1} K_{a,j} \cdot [\text{H}^+]^{n-i}}{\sum_{k=0}^{n} \prod_{j=0}^{k-1} K_{a,j} \cdot [\text{H}^+]^{n-k}}$$

The titration volume at any pH is derived from the average deprotonation charge:

$$V_b = V_a \cdot \frac{C_A \bar{n} - [\text{H}^+] + K_w/[\text{H}^+]}{C_B + [\text{H}^+] - K_w/[\text{H}^+]}$$

---

## Deployment

The repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and publishes to **GitHub Pages** on every push to `main`.

**Required setup in GitHub:**

1. Go to **Settings → Pages → Source** and select *GitHub Actions*.
2. Push to `main` — the workflow handles everything else.

---

## Project Structure

```
src/
├── features/
│   ├── chemistry/
│   │   ├── components/   # Chart and panel components
│   │   ├── lib/          # acid-math.ts, equilibria.ts, formulas.ts
│   │   └── types/        # Shared TypeScript models
│   ├── i18n/             # Translations (ES/EN)
│   └── theme/            # Theme provider and toggle
├── data/acids.ts          # 50+ acid database
├── hooks/                 # useAcidBaseState
├── layouts/               # Responsive layout variants
└── components/            # Shared UI primitives
```

---

## License

[MIT](./LICENSE) © 2026 jigonzalez930209
