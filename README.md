# Seniors' Club - Matching Application

A modern matchmaking application designed for older people. Built with Java, Spring Boot, PostgreSQL, TypeScript, and React.

---

## ✨ Features

- **Profile Management** - Create and customize your profile with bio, hobbies, preferences, and profile picture
- **Find New Connections** - Smart matching algorithm finds perfect matches based on gender preference, age, location, and mutual interests
- **Real-time Chat** - Talk to your connections instantly with WebSocket-powered messaging
- **Responsive Design** - Find new connections on every device



## 🛠️ Tech Stack

**Frontend:**
- TypeScript + React + Vite + Tailwind CSS

**Backend:**
- Java + Spring Boot

**Database:**
- PostgreSQL 14 + Docker



## 📋 Prerequisites

- **Docker Desktop** - Required for running the application
- Git - For cloning the repository

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://gitea.kood.tech/jeremyvaask/web.git
cd web
```

### 2. Run the Application

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
Name: matchme

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

## 🌱 Optional: Seed Database

To use the application with 100 seed users:

1. Go to `docker-compose.yml` and uncomment line 42
2. Run:

```bash
docker-compose up
```

The seed users will be automatically created.

---

## 📱 Usage

### 1. Create an Account
- Navigate to the registration page
- Fill in your email, password, and basic info
- Upload a profile picture

### 2. Complete Your Profile
- Add your bio, hobbies, and interests
- Set your preferences (age range, gender, distance)
- Enable location sharing for proximity-based matching

### 3. Start Exploring
- Browse recommended profiles
- **Like (❤️)** users you're interested in
- **Skip (✕)** to move to the next profile

### 4. Chat with Matches
- View your matches in the sidebar
- Click to open a chat window
- Send messages with real-time delivery
- See typing indicators and read receipts

### 5. Manage Connections
- View pending connection requests
- Accept or decline requests
- Disconnect from users if needed



## 🏗️ Project Structure

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
│   │   └── security/         # JWT authentication
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/              # API service layer
│   │   ├── components/       # React components
│   │   │   ├── buttons/      # Button components
│   │   │   ├── chat/         # Chat-related components
│   │   │   ├── profile/      # Profile components
│   │   │   └── sidebar/      # Sidebar sections
│   │   ├── context/          # React Context providers
│   │   ├── pages/            # Page components
│   │   └── App.tsx           # Main app component
│   └── package.json
│
└── README.md
```

## 🐳 Docker Commands

### Start the Application
```bash
docker-compose up
```

### Rebuild After Changes
```bash
docker-compose up --build
```

### Stop the Application
```bash
Ctrl + c 
docker-compose down
```
---


## 👥 Authors

- Jeremy Vaask
- Aigar Orav
- Timo Lipp


