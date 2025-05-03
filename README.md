
# GPU Cost Optimizer & Recommender

## Overview

A web application designed to help users select cost-effective GPU instances for their machine learning workloads. Users can input workload details (e.g., model type, dataset size, task, budget, and region), and the app recommends the best GPU instances based on pricing and suitability.

---

## Features

- **Workload Form:** Users can specify their workload requirements (model type, dataset size, task, budget, region).
- **Scoring-Based Recommendations:** GPUs are ranked based on how well they match user criteria, using a scoring system.
- **Cost Optimization:** Displays pricing details (hourly, monthly, spot) for recommended GPUs.
- **Explanations:** Provides reasoning for each recommendation based on a knowledge base.
- **Error Handling:** Gracefully handles API failures by falling back to mock data.
- **Containerized:** Uses Docker and Docker Compose for easy deployment on any machine.
- **Caching:** Implements in-memory caching to reduce API calls and handle rate limits.

---

## Tech Stack

- **Frontend:** React, JavaScript
- **Backend:** Node.js, Express
- **Containerization:** Docker, Docker Compose
- **External API:** Fetches GPU pricing from Acecloud API
- **Data:** Mock pricing data and knowledge base for fallback scenarios

---

## Prerequisites

- Docker
- Docker Compose
- Git
- Node.js (version 18.x recommended)
- React

---

## For Windows Users (Using WSL)

If you’re on Windows, it’s recommended to use **Windows Subsystem for Linux (WSL)** for better Docker performance:

1. **Install WSL:** Follow the [WSL Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install).
2. **Install Ubuntu in WSL:**
   ```bash
   wsl --install -d Ubuntu
   ```
3. **Install Docker Desktop on Windows and enable WSL integration:**
   Follow the [Docker Desktop WSL Setup](https://docs.docker.com/desktop/wsl/).

---

## Project Structure

```
RTDS_SD_018/
├── front/               # Frontend (React app)
│   ├── src/             # React source code
│   ├── Dockerfile       # Dockerfile for frontend
│   └── package.json     # Frontend dependencies
├── server/              # Backend (Node.js/Express)
│   ├── server.js        # Backend source code
│   ├── Dockerfile       # Dockerfile for backend
│   ├── ai-assistant.js  # AI Chatbot
│   └── package.json     # Backend dependencies
├── docker-compose.yml   # Docker Compose configuration
└── README.md            # Project documentation
```

---

## Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/SD_018.git
cd SD_018
```

### 2️⃣ Build and Run the Containers

```bash
docker-compose up --build
```

- Backend runs at: **http://localhost:3001**
- Frontend runs at: **http://localhost:3000**

### 3️⃣ Access the Application

Open your browser and go to:

**http://localhost:3000**

You should see the workload form for the GPU Cost Optimizer & Recommender.

### 4️⃣ Test the Application

Example input:

- **Model Type:** LlaMa
- **Dataset Size:** 80 GB
- **Task:** Training
- **Budget:** $2000/month
- **Region:** Mumbai

### 5️⃣ Stop the Containers

```bash
docker-compose down
```

---

## Troubleshooting

### 🔧 Build Fails During `npm install`

- Ensure `package.json` exists in both `client/` and `server/`.
- Run manual installs:

    ```bash
    cd server && npm install
    cd ../client && npm install
    cd ..
    docker-compose up --build
    ```

### 🔧 Frontend Can’t Reach Backend

- Check if backend is running:

    ```bash
    docker logs sd_018-backend-1
    ```

    You should see **Backend on port 3001**.

- Verify frontend’s `package.json` contains:

    ```json
    "proxy": "http://backend:3001"
    ```

### 🔧 Port Conflicts

If ports **3000** or **3001** are in use:

```bash
sudo lsof -i :3000
sudo lsof -i :3001
```

Kill the conflicting process:

```bash
kill -9 <pid>
```

### 🔧 Slow Build

- Use `node:18-slim` in Dockerfiles to reduce image size.
- Clear Docker build cache:

    ```bash
    docker builder prune
    ```

---

Feel free to open an issue or contribute improvements!
