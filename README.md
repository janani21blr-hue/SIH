# SIH26189 - Criminal Network Analysis & Intelligence Platform

AI-Powered Criminal Network Analysis System (CNAS) built with React, TypeScript, Vite, Tailwind CSS, Recharts, and React Force Graph.

## Features

- **Executive Intelligence Dashboard**: Real-time overview of active investigations, suspect entities, flagged relationships, risk distributions, timeline velocity, and high-risk criminal networks.
- **Interactive Force Network Graph**: Visual graph exploration powered by `react-force-graph-2d` with dynamic physics simulation, zoom/pan controls, and particle flows.
- **Analytics & Explainability (`recharts`)**:
  - Risk distribution analysis categorizing threats (Low, Medium, High, Critical).
  - Investigation velocity timeline mapping relationship frequency over months.
  - Evidence-linked "Explain This Network" rationale with numbered findings and evidence source tags.
- **Deep Investigation Workbench**:
  - Entity category filters (People, Phones, Accounts, Vehicles, Companies, Addresses).
  - Relationship type filtering and confidence indicators.
  - Multi-hop investigation path tracking with breadcrumbs and backtrack navigation.
  - Collapsible inspector panel with entity dossiers and evidence links.
- **Entity Directory**: Searchable list of identified criminal personas and digital identifiers.
- **Reports & Intelligence Briefings**: Structured summaries of network patterns with PDF export capability.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
