GPU Cost Optimizer & Recommender


Overview

A web application designed to help users select cost-effective GPU instances for their machine learning workloads. Users can input workload details (e.g., model type, dataset size, task, budget, and region), and the app recommends the best GPU instances based on pricing and suitability.


Features

Workload Form: Users can specify their workload requirements (model type, dataset size, task, budget, region).
Scoring-Based Recommendations: GPUs are ranked based on how well they match user criteria, using a scoring system.
Cost Optimization: Displays pricing details (hourly, monthly, spot) for recommended GPUs.
Explanations: Provides reasoning for each recommendation based on a knowledge base.
Error Handling: Gracefully handles API failures by falling back to mock data.
Containerized: Uses Docker and docker-compose for easy deployment on any machine.
Caching: Implements in-memory caching to reduce API calls and handle rate limits.


Tech Stack

Frontend: React, JavaScript
Backend: Node.js, Express
Containerization: Docker, docker-compose
External API: Fetches GPU pricing from API provided by Acecloud
Data: Mock pricing data and knowledge base for fallback scenarios

Prerequisites

Docker
Docker Compose
Git
Node.js (version 18.x recommended)
React

For Windows Users (Using WSL)
If you’re on Windows, we recommend using Windows Subsystem for Linux (WSL) for better Docker performance:

Install WSL: WSL Installation Guide
Install Ubuntu in WSL: Run wsl --install -d Ubuntu in a Windows Command Prompt.
Install Docker Desktop on Windows and enable WSL integration: Docker Desktop WSL Setup.

Project Structure

RTDS_SD_018/
├── front/               # Frontend (React app)
│   ├── src/              # React source code
│   ├── Dockerfile        # Dockerfile for frontend
│   └── package.json      # Frontend dependencies
├── server/               # Backend (Node.js/Express)
│   ├── server.js/        # Backend source code
│   ├── Dockerfile        # Dockerfile for backend
│   ├── ai-assistant.js   # AI Chatbot
│   └── package.json      # Backend dependencies

├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation


Setup Instructions

Follow these steps to set up and run the project locally.
1. Clone the Repository
Clone the project from GitHub:
git clone https://github.com/<your-username>/SD_018.git
cd SD_018

2. Build and Run the Containers
Use docker-compose to build and run the containers:
docker-compose up --build


This command builds the backend and frontend containers and starts them.
The backend will run on http://localhost:3001.
The frontend will run on http://localhost:3000.

3. Access the Application

Open your browser and navigate to http://localhost:3000.
You should see the workload form for the GPU Cost Optimizer & Recommender.

4. Test the Application

Fill out the workload form:
Model Type: LlaMa
Dataset Size: 80 GB
Task: Training
Budget: $2000/month
Region: Mumbai


5. Stop the Containers
To stop the running containers:
docker-compose down

Troubleshooting

Build Fails During npm install:
Ensure package.json exists in both client/ and server/.
Run npm install manually in each directory, then rebuild:cd server && npm install
cd ../client && npm install
cd ..
docker-compose up --build




Frontend Can’t Reach Backend:
Verify the backend is running (docker logs sd_018-backend-1 should show Backend on port 3001).
Check the frontend’s package.json for the correct proxy:"proxy": "http://backend:3001"




Port Conflicts:
If ports 3000 or 3001 are in use, stop other processes using them:sudo lsof -i :3000
sudo lsof -i :3001

Kill the processes using kill -9 <pid>.


Slow Build:
Use node:18-slim in the Dockerfiles to reduce image size.
Clear Docker build cache:docker builder prune



