# 🥗 Habit-Aware Food Coach

![Prototype Status](https://img.shields.io/badge/Status-Hackathon_Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)
![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow)

**Habit-Aware Food Coach** is an AI-powered, context-aware web application designed to provide personalized, real-time dietary recommendations and evidence-based behavioral micro-missions. It moves beyond static calorie counting by using data such as simulated time, location, and physiological goals to intelligently rank meals. 

This prototype is built specifically for a fast-paced hackathon environment—featuring a completely self-contained architecture, dynamic scoring engines, and live API integrations.

---

## ✨ Key Features

- **Context-Aware Recommendations Engine:** Real-time AI ranking of meals based on 3 pillars:
  - **Health Score (40%)**: Driven by Nutri-Score, NOVA classifications, and macro profiles.
  - **Personal Fit (35%)**: Tailored to diet types (Keto, Vegan), allergies, goals, and budget.
  - **Context Fit (25%)**: Adjusts dynamically based on time of day (Morning/Night) and location (Home/Office).
- **Gemini AI Chatbot:** A globally accessible, floating AI assistant using the Gemini 1.5 Flash model, pre-prompted to provide concise, friendly nutritional coaching.
- **Firebase Authentication Barrier:** Secure routing utilizing Firebase Google Sign-in, Email/Password generation, and Phone Auth (with invisible reCAPTCHA).
- **Barcode & Label Scanner:** Direct integration with the free **Open Food Facts API** to fetch product data, Nutri-Scores, and processing warnings on the fly.
- **Evidence-Based "Micro-Missions":** A 12-week challenge system inspired by clinical RCTs (like the HAPPY trial) to encourage sustained behavioral changes (e.g., "Veggie Boost").
- **DQS Dashboard:** A high-fidelity Diet Quality Score tracker utilizing dynamic `recharts`.
- **Demo Context Simulator:** A built-in feature allowing presentation judges to instantly switch the user's location and time to see the algorithm re-rank meals live without needing a backend server refresh.

---

## 🛠️ Technology Stack

### Core Frontend
- **Framework:** React + Vite
- **Routing:** `react-router-dom`
- **Styling:** Custom "Glassmorphism" Design System (Vanilla CSS / Custom Tokens)
- **Icons & Data Viz:** `lucide-react`, `recharts`

### Data & Authentication
- **Authentication:** Firebase Auth SDK v10 (OAuth, Classic, Phone)
- **AI Integration:** `@google/genai` (Gemini API)
- **External Data:** Open Food Facts REST API (`world.openfoodfacts.org`)
- **State Management:** React Context API + Seamless `localStorage` persistence

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### 1. Installation
Clone the repository and install the dependencies.
```bash
# Navigate to the app directory
cd food-coach

# Install NPM dependencies
npm install
```

### 2. Environment Variables
To keep the application secure, API keys are excluded from git.
1. Copy the `.env.example` file and rename it to `.env`.
2. Fill in your keys (You will need a Firebase Web App config and a Google Gemini API Key).

```env
# .env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="sender-id"
VITE_FIREBASE_APP_ID="app-id"
VITE_FIREBASE_MEASUREMENT_ID="measurement-id"

VITE_GEMINI_API_KEY="your-gemini-key"
```

> **Note**: For Phone and Google authentication to work, ensure these providers are enabled in your Firebase Console under **Build > Authentication > Sign-in method**.

### 3. Start Development Server
```bash
npm run dev
```
The app will securely boot on `http://localhost:5174/` or similar.

---

## 🏛️ Project Architecture Highlights

- **`src/engine/`**: Contains the core algorithmic logic. 
  - `scoringEngine.js` calculates the composite fit of a meal.
  - `contextEngine.js` derives temporal and situational signals.
- **`src/context/AppContext.jsx`**: The application's central nervous system. It hydrates local storage, actively listens to Firebase `onAuthStateChanged` events, and acts as the state manager.
- **`src/data/`**: JSON-style mock repositories representing the backend database for rapid hackathon iteration without latency.

---
_Built to solve the modern challenge of overwhelming, static nutritional advice by offering contextual, habit-driven guidance._
