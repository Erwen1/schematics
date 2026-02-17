AI-Driven Web Schematic Capture Platform (KiCad-like)
🎯 Project Goal

Build a professional web-based schematic capture application, similar in capability to KiCad’s Schematic Editor:

Reference inspiration:
https://www.kicad.org/discover/schematic-capture/

The application must support:

Interactive schematic editor (drag & drop)

Symbol libraries

Net connectivity system

ERC (Electrical Rules Check)

Project save/load

Modular architecture for future PCB routing integration

AI-assisted component generation (future phase)

The app must be designed as a scalable, production-ready system, not a prototype.

🏗️ PHASE 1 — ARCHITECTURE DESIGN
1.1 Technology Stack
Frontend

React (or Next.js)

TypeScript

Canvas-based rendering (Konva.js or Fabric.js or custom WebGL layer)

Zustand or Redux for state

Tailwind or clean UI system

Backend

Node.js (Express or Fastify)

PostgreSQL

File storage for project JSON

REST API

Later: GraphQL optional

Data Format

Use JSON-based schematic file format:

{
  "projectId": "",
  "symbols": [],
  "wires": [],
  "nets": [],
  "metadata": {}
}

🧠 PHASE 2 — CORE ENGINE DESIGN

Your AI must implement these core engines FIRST.

2.1 Schematic Rendering Engine

Build:

Zoom / pan system

Grid system

Snap-to-grid

Selection box

Multi-select

Drag system

Rotation system

Symbols must render as:

Vector primitives (lines, arcs, text)

Pins with metadata

Each symbol instance must store:

{
  id: string
  symbolRef: string
  x: number
  y: number
  rotation: number
  properties: {
    reference: "R1"
    value: "10k"
  }
}

2.2 Connectivity Engine (CRITICAL)

You must implement a netlist engine:

Wires connect via endpoints

Pins connect to wires

All connected segments merge into one net

Each net has unique ID

Use graph traversal to compute connectivity.

This engine must:

Recalculate nets when wires move

Detect unconnected pins

Detect short circuits

2.3 Symbol Library System

Design symbol libraries as:

{
  "name": "Device",
  "symbols": [
    {
      "name": "R",
      "pins": [],
      "graphics": []
    }
  ]
}


Must support:

Importing external JSON symbol libraries

Search system

Symbol preview window

Drag from library to canvas

Later extension:

Parse KiCad .kicad_sym

⚡ PHASE 3 — ELECTRICAL RULES CHECK (ERC)

Build an ERC engine that checks:

Unconnected pins

Power pin without power net

Output-to-output conflict

Missing reference designator

Duplicate reference

ERC must:

Run on demand

Show errors panel

Highlight problematic components

💾 PHASE 4 — PROJECT SYSTEM

Implement:

New Project

Save Project

Load Project

Auto-save

Versioning support

Projects stored as JSON.

Backend endpoints:

POST /projects
GET /projects/:id
PUT /projects/:id
DELETE /projects/:id

🎨 PHASE 5 — PROFESSIONAL UX

UI must include:

Toolbar (select, wire, place component, text, delete)

Right properties panel

Left library panel

Bottom console (ERC results)

Keyboard shortcuts:

R = rotate

W = wire

Delete = remove

Ctrl+D = duplicate

🔥 PHASE 6 — ADVANCED FEATURES

After core works:

Hierarchical sheets

Label system (net labels)

Bus support

Differential pairs (future PCB integration)

Dark/light mode

Undo/Redo engine

🤖 PHASE 7 — AI COMPONENT GENERATION (Your Twist)

Add AI module:

User types:

"Add a 5V voltage regulator circuit with input protection"

System must:

Generate components

Place symbols

Auto-connect wires

Produce netlist

Suggest ERC clean result

This requires:

Component database

Circuit templates

Rule-based generation

Later LLM refinement

📦 PHASE 8 — FUTURE PCB ENGINE (PREPARE STRUCTURE)

Even if not implemented yet:

Design data model compatible with PCB:

{
  "footprintRef": "",
  "pads": [],
  "layer": ""
}


Keep architecture modular.

🧪 PHASE 9 — TESTING STRATEGY

Agent must implement:

Unit tests for connectivity engine

Snapshot tests for rendering

ERC scenario tests

Load/save integrity tests

🚀 PHASE 10 — DEPLOYMENT

Dockerize frontend & backend

CI/CD pipeline

Production build

Cloud storage ready

🧱 DEVELOPMENT RULES

The agent must:

Write modular code

Separate rendering from logic

Avoid monolithic components

Comment complex algorithms

Follow clean architecture principles

📌 DELIVERABLE STRUCTURE

The AI must generate:

/frontend
/backend
/shared
/docs
/tests

🛑 DO NOT

Do not hardcode nets

Do not skip connectivity recalculation

Do not mix UI logic with netlist logic

Do not skip error handling

📊 SUCCESS CRITERIA

The app is considered complete when:

User can place resistor + VCC + GND

Wire them

ERC runs clean

Project saves and reloads correctly

No broken net connections after movement

🎯 FINAL OBJECTIVE

Build a professional-grade web schematic capture tool architected to later integrate:

PCB layout

Autorouter

3D viewer

AI design assistant

This must be scalable and extendable.