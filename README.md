# T1D Spatial Atlas

An interactive, AI-powered platform for analyzing CosMX (NanoString) spatial transcriptomics data from human pancreatic tissues. This project enables exploration of spatial gene expression and cell-type-specific changes across key stages of type 1 diabetes progression.

---

## Project Structure

- **frontend/**: React web application (Material-UI) for user interaction, visualization, and AI chat.
- **backend/**: Python (Flask-like) API server that handles requests from the frontend, manages user input, and communicates with the Rserver.
- **Rserver/**: R HTTP server that performs data analysis and generates images/plots using Seurat and ggplot2.

---

## Quick Start (Docker Compose)

This project uses Docker Compose to orchestrate all services. You need Docker installed.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd T1DPancreas-React
```

### 2. Build and start all services
```bash
docker-compose up --build
```

- This will build and start:
  - The **frontend** (React app)
  - The **backend** (Python API server) !under development
  - The **Rserver** (R HTTP server) !under development

### 3. Access the app
- Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

## Directory Overview

### frontend/
- React app (Material-UI)
- All user-facing pages: Home, FOV Viewer, Gene Expression, AI Chat, About
- Handles user input, displays images/plots, and communicates with the backend via HTTP API

### backend/
- Python API server
- Receives requests from frontend, validates/processes input
- Communicates with Rserver for heavy computation and image generation
- Handles email notifications for long-running jobs

### Rserver/
- R HTTP server (using httpuv)
- Loads Seurat objects and performs spatial transcriptomics analysis
- Generates images/plots and returns them to the backend

---

## Environment & Secrets
- **Do not commit secrets or API keys!**
- All sensitive config (API keys, email credentials) should be set via environment variables or Docker secrets.
- See `.gitignore` for ignored files.

---

