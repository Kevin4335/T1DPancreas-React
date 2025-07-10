# T1D Spatial Atlas

An interactive, AI-powered platform for analyzing CosMX (NanoString) spatial transcriptomics data from human pancreatic tissues. This project enables exploration of spatial gene expression and cell-type-specific changes across key stages of type 1 diabetes progression.

---

## Project Structure

- **frontend/**: React web application (Material-UI) for user interaction, visualization, and AI chat.
- **backend/**: Python (Flask-like) API server that handles requests from the frontend, manages user input, and communicates with the Rserver.
- **Rserver/**: R HTTP server that performs data analysis and generates images/plots using Seurat and ggplot2.

---

## Quick Start (Docker Compose) For DEV

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
  - The **backend** (Python API server) will start but not serve frontend
  - The **Rserver** (R HTTP server) !under development

### 3. Access the app
- Open your browser and go to: [http://localhost:3000](http://localhost:3000)
- Backend Api can be accessed, however, the frontend is served only under port 3000
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
- All sensitive config (API keys, email credentials) should be set via environment variables or Docker secrets or set in config.py or .env files
- See `.gitignore` for ignored files.

---

## Deployment Instructions
### First Time on Server
- Contact server admin to open ports 9035, 80 and 22
- Move all files except node_modules and __pycache from local to the `ubuntu@{server_ip}` under folder "webserver"
- Advised to use VSCode
- Ensure you have rsa key file and added to rsa keys locally
- Install Docker: 
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
```
- Ensure you are working in webserver directory
- Run production docker to build the React app and serve it with backend api:
```bash
sudo docker-compose -f docker-compose.prod.yml up --build -d
```
- Wait for command to run. Container is now running in background
- Run these to open the ports:
```bash
sudo ufw allow 80
sudo ufw allow 9035
sudo ufw allow 22
sudo ufw enable
```
- Verify that docker container is running:
```bash
sudo docker ps
```
You can now safely leave. There should only be one container running. Ensure that the server is accessible at `http://{server_ip}:9035`

---

### Update Existing Code
- Destroy the old container. First identify it's name. There should be only one.
```bash
sudo docker ps
```
- Then run:
```bash
sudo docker kill <container_name>
sudo docker rm <container_name>
```
- Procede to replace pieces of code. Simply delete files and add new ones. This includes backend and frontend files
- Then restart the Docker container:
```bash
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml up -d
```
---

## Notes
- The production docker system serves the built frontend code using the backend server on port 9035. This is different from the development docker system which creates 2 docker containers, one for frontend (port 3000) and one for backend (port 9035).
- The development frontend is configured for live code reload. The production environment is not. 

## Troubleshooting

- **Docker Permission Denied**
  Run Docker commands with `sudo` or add user to the `docker` group:
  ```bash
  sudo usermod -aG docker $USER
  ```
  - Note: `sudo usermod -aG docker $USER` may not be guaranteed to work. Try to logoff and in. This may also not work.

## Future Plans
 - Enable automatic builds and deployments