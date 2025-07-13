# T1D Spatial Atlas

An interactive, AI-powered platform for analyzing CosMX (NanoString) spatial transcriptomics data from human pancreatic tissues. This project enables exploration of spatial gene expression and cell-type-specific changes across key stages of type 1 diabetes progression.

---

## Project Structure

- **frontend/**: React web application (Material-UI) for user interaction, visualization, and AI chat.
- **backend/**: Python API server that handles requests from the frontend, manages user input, and communicates with the R server.
- **Rserver/**: R HTTP server that performs data analysis and generates images/plots using Seurat and ggplot2.

---

## Quick Start (Docker Compose) For DEV

This project uses Docker Compose to orchestrate services. You need Docker installed.

### 1. Clone the repository
```bash
git clone https://github.com/Kevin4335/T1DPancreas-React.git
cd T1DPancreas-React
```

### 2. Build and start all services
```bash
docker-compose up --build
```

- This will build and start:
  - The **frontend** (React app)
  - The **backend** (Python API server) on port 9035 (also serves the React app)

### 3. Access the app
- Open your browser and go to: [http://128.84.40.121:9035](http://128.84.40.121:9035)
- The frontend and backend are served together on this port
- R server must be running manually on port 5000 for full functionality

---

## Directory Overview

### frontend/
- React app (Material-UI)
- All user-facing pages: Home, FOV Viewer, Gene Expression, AI Chat, About
- Handles user input, displays images/plots, and communicates with the backend via HTTP API

### backend/
- Python API server (Flask-like)
- Serves the React app
- Receives requests from frontend, validates/processes input
- Communicates with Rserver for computation and image generation
- Handles email notifications for long-running jobs

### Rserver/
- R HTTP server (httpuv)
- Loads Seurat objects and performs spatial transcriptomics analysis
- Generates images/plots and returns them to the backend
- **Note**: Not dockerized. Install all R dependencies manually via `pak`

---

## Environment & Secrets
- **Do not commit secrets or API keys!**
- All sensitive config (API keys, email credentials) should be set via environment variables, Docker secrets, or config files like `.env` or `config.py`
- See `.gitignore` for ignored files.

---

## Deployment Instructions

### First Time on Server
- Contact server admin to open ports 9035 and 5000
- Move all project files (excluding `node_modules/`, `__pycache__/`) to `ubuntu@{server_ip}` under folder `webserver`
- Recommended to use VSCode Remote SSH
- Ensure your SSH key is configured locally

Install Docker:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
```

Start production docker:
```bash
sudo docker-compose -f docker-compose.prod.yml up --build -d
```

Open required ports:
```bash
sudo ufw allow 9035
sudo ufw allow 5000
sudo ufw enable
```

Verify container:
```bash
sudo docker ps
```

Access the app at: `http://{server_ip}:9035`

---

### Update Existing Code

Kill and remove the current container:
```bash
sudo docker ps
sudo docker kill <container_name>
sudo docker rm <container_name>
```

Replace code files as needed (frontend/backend)

Restart:
```bash
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml up -d
```

---

### Troubleshooting Deployment

If errors persist:
```bash
sudo docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
sudo docker image prune -a
```
Then:
```bash
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml up -d
```

---

## Notes
- In production, the backend server (port 9035) serves both API and static React frontend
- In development, frontend is served on port 3000 and backend on 9035
- R server is run separately and **not dockerized**, starts manually

---

## R Server Setup

To run the R server:
```bash
nohup Rscript Functions_for_website.R > server.log 2>&1 &
```
To check if it's running:
```bash
ps aux | grep Functions_for_website.R
```

Install all R dependencies using `pak::pak()` manually.

---

## Future Plans
- Containerize the R server for easier deployment
- Implement automatic builds and deployments via CI/CD
- Add persistent image caching/storage and expiration management

---
