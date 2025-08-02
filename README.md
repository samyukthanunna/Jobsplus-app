# JobsPlus-app

A professional job network platform with Web3 and AI integrations.

## 🌟 Features

* **User Authentication:** Secure user registration and login with JWT.
* **Dynamic Job Feed:** Browse and search through job listings with filters for skills, location, and job type.
* **AI-Powered Matching:** Get a personalized "match score" for jobs based on your profile skills and bio.
* **AI Resume Parser:** Automatically extract skills from a user's bio to populate their profile.
* **Blockchain Payments:** Post premium job listings by paying a fee on the Ethereum (via MetaMask) or Solana (via Phantom) testnet.
* **Responsive Design:** A clean, modern interface built with Tailwind CSS.

## 🚀 Technology Stack

**Backend (Node.js & Express)**
* **Express.js:** Web server framework.
* **bcryptjs:** For password hashing.
* **jsonwebtoken:** For secure user authentication.
* **CORS:** For handling cross-origin requests.

**Frontend (HTML & JavaScript)**
* **HTML5:** The core structure of the application.
* **Tailwind CSS:** A utility-first CSS framework for rapid styling.
* **Web3.js:** For interacting with the Ethereum blockchain (via MetaMask).
* **Solana Web3.js:** For interacting with the Solana blockchain (via Phantom).
* **Vanilla JavaScript:** All client-side logic is written in plain JavaScript.

## ⚙️ How to Run Locally

### Prerequisites
* Node.js (v14 or higher)
* npm (or yarn)
* A code editor like VS Code

### Backend Setup
1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Start the server: `node app.js`
4.  The backend will run on `http://localhost:5000`.

### Frontend Setup
1.  Open the `frontend/index.html` file in your web browser.
2.  Ensure the `API_BASE` variable in the script tag is set to the local backend URL:
    ```javascript
    const API_BASE = 'http://localhost:5000/api';
    ```

## 🌐 Live Application
* **Frontend URL:** `https://jobsplus-app.vercel.app/`
* **Backend URL:** `https://jobsplus-app.onrender.com`
