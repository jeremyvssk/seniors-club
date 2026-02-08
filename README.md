# Seniors' Club - Matching Application

A modern matchmaking application designed for older people. Built with Java, Spring Boot, PostgreSQL, TypeScript, and React.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Seed Database](#seed-database)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Docker Commands](#docker-commands)
- [Authors](#authors)

---

## Features

- **Profile Management** - Create and customize your profile with bio, hobbies, preferences, and profile picture
- **Find New Connections** - Smart matching algorithm finds perfect matches based on: 
  - Gender preference 
  - Age
  - Location 
  - Mutual interests
- **Real-time Chat** - Talk to your connections in real-time powered by WebSocket
- **Responsive Design** - Find new connections on every device

---

## Tech Stack

**Frontend:**
- TypeScript + React + Vite + Tailwind CSS

**Backend:**
- Java + Spring Boot

**Database:**
- PostgreSQL 14 + Docker

---

## Prerequisites

- **Docker Desktop** - Required for running the application
- **Java 17+**

Download Docker Desktop for free: https://www.docker.com/products/docker-desktop/ 

---

## Installation

### 1. Clone the Repository

```bash
git clone https://gitea.kood.tech/jeremyvaask/web.git
cd web
```

### 2. Run the Application

**Note:** Use `docker compose` (modern) or `docker-compose` (legacy) depending on your Docker version. Both commands work the same way.

```bash
docker-compose build --no-cache
docker-compose up
```

This automatically installs all the necessary dependencies and runs both backend and frontend.

### 3. Set Up Database

1. Go to: http://localhost:5050
2. Log in with:
   - **Email:** `admin@matchme.com`
   - **Password:** `adminho`
3. Create a new server with these settings:

```
General:
Name: matchme-db

Connection:
Host: postgres
Port: 5432
Database: matchme
Username: matchme_user
Password: matchme-password
```

### 4. Use the Application

Go to: http://localhost:5173

---

## Seed Database

**(Optional)** 

To use the application with 100 seed users:

1. Go to `docker-compose.yml` and uncomment line 42 by removing the `#`:

```yaml
    SPRING_DEVTOOLS_RESTART_ENABLED: "true"
    # Remove the # below to automatically seed 100 users
    SPRING_PROFILES_ACTIVE: seed
```

2. Run:

```bash
docker-compose up
```

The seed users will be automatically created.

---

## Usage

### 1. Create an Account
- Navigate to the registration page at http://localhost:5173/
- Create an account by completing the registration steps

### 2. Complete Your Profile
- After successfully creating an account, you'll be guided through the account completion steps

### 3. Start Exploring
- Browse recommended profiles
- **Like (❤️)** users you're interested in
- **Skip (✕)** to move to the next profile

### 4. Manage Connection Requests
- When you like a user, it sends them a connection request
- Received requests can be found and interacted with in the **Requests** tab

### 5. View Your Matches
- Once a request is accepted, the user appears in the **Matches** tab
- Click on a match to view their full profile
- You can **Disconnect** from users at any time if needed

### 6. Chat with Matches
- Open the **Messages** tab
- Click on a match to open the chat window
- Send messages with real-time delivery
- See when the other person is typing
- Unread message notifications appear as red dots on the Messages icon

---

## Project Structure

```
web/
├── backend/
│   ├── src/main/java/com/matchme/backend/
│   │   ├── config/           # Security, WebSocket, CORS configs
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA entities
│   │   ├── repo/             # JPA repositories
│   │   ├── service/          # Business logic
│   │   ├── security/         # JWT authentication
│   │   ├── util/             # Utility classes
│   │   ├── UserSeeder.java   # Database seeding
│   │   └── MatchMeBackendApplication.java  # Main application
│   ├── src/main/resources/
│   │   └── application.properties  # Backend configuration
│   ├── Dockerfile            # Backend container setup
│   └── pom.xml               # Maven dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API service layer
│   │   ├── components/       # React components
│   │   │   ├── buttons/      # Button components
│   │   │   ├── chat/         # Chat components
│   │   │   ├── create-user/  # Steps to complete profile
│   │   │   ├── edit-profile/ # Profile editing
│   │   │   ├── headers/      # Header components
│   │   │   └── sidebar/      # Navigation sections
│   │   ├── context/          # React Context providers (global state)
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Application entry point
│   ├── index.html            # HTML entry point
│   ├── vite.config.ts        # Vite configuration
│   ├── Dockerfile            # Frontend container setup
│   └── package.json          # npm dependencies
│
└── docker-compose.yml        # Docker orchestration
```

---

## Docker Commands

**Note:** Use `docker compose` (modern) or `docker-compose` (legacy) depending on your Docker version. Both commands work the same way.

### Start the Application
```bash
docker-compose up
```

### Rebuild After Changes
```bash
docker-compose up --build
```

### Stop the Application
Press `Ctrl + C` in the terminal where docker-compose is running, then run:
```bash
docker-compose down
```

---

## Authors

- Jeremy Vaask
- Aigar Orav
- Timo Lipp