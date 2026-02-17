# Schematics Project

A professional web-based schematic capture and PCB design tool.

## Prerequisites

Before you begin, ensure you have [Node.js](https://nodejs.org/) installed on your system.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Erwen1/schematics.git
   ```
2. Navigate to the project directory:
   ```bash
   cd schematics
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Getting Started

To run the project locally in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the TypeScript code and builds the project for production.
- `npm run preview`: Previews the production build locally.
- `npm run test`: Runs the test suite using Vitest.
- `npm run test:ui`: Runs Vitest with a graphical user interface.

## Project Structure

- `src/`: Contains the source code (React + TypeScript).
- `src/engine/`: Core logic for schematic routing and electronics.
- `src/components/`: Reusable UI components.
- `src/store/`: State management using Zustand.

## License

Private / Confidential
