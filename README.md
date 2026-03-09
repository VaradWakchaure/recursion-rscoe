# Recursion by RSCOE

A full-stack **online quiz platform** built with **Node.js, Express, MongoDB, and Vanilla JavaScript**.
The platform allows participants to attempt timed quizzes while administrators manage questions and rounds.

---

## 🚀 Features

### Authentication

* User registration and login
* Password hashing using **bcrypt**
* Authentication using **JWT tokens**

### Quiz System

* Start quiz by round
* Randomized question selection using MongoDB `$sample`
* Resume quiz if session already exists
* 15 minute countdown timer
* Automatic quiz submission when time expires

### Anti-Cheat Mechanisms

* Tab switch detection
* Quiz auto-submit after multiple warnings

### Answer Handling

* Auto-save answers every 10 seconds
* Server-side score calculation
* Duplicate answer protection

### Result & Leaderboard

* Result page with score and rank
* Leaderboard sorted by:

  * Highest score
  * Earliest submission time

### Admin Panel

* Add questions for specific rounds
* Set correct answers
* Manage quiz content

---

## 🛠 Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **MongoDB (Mongoose)**
* **JWT Authentication**

### Frontend

* **HTML**
* **CSS**
* **Vanilla JavaScript**

---

## 📂 Project Structure

```
recursion-rscoe/
│
├── config/
│   └── db.js
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
│
├── public/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── quiz.html
│   ├── result.html
│   ├── leaderboard.html
│   └── admin.html
│
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/VaradWakchaure/recursion-rscoe.git
cd recursion-rscoe
```

### 2. Install dependencies

```
npm install
```

### 3. Create `.env` file

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Start the server

```
node server.js
```

Server runs at:

```
http://localhost:5000
```

---

## 📊 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Quiz

```
POST /api/quiz/start/:round
GET  /api/quiz/questions/:round
POST /api/quiz/save-answers
POST /api/quiz/submit
POST /api/quiz/tab-switch
GET  /api/quiz/result/:round
GET  /api/quiz/leaderboard/:round
```

### Admin

```
POST /api/admin/question
```

---

## 🧪 Security Measures

* Password hashing using **bcrypt**
* JWT based authentication
* Protected API routes
* Server-side scoring
* Tab switch monitoring
* Quiz timer enforcement

---

## 📌 Future Improvements

* Email verification during registration
* Sending quiz results via email
* Automatic participation certificates
* Admin dashboard improvements
* Support for multiple quiz rounds

---

## 👨‍💻 Author

**Varad Wakchaure**

Second-year Information Technology student
Project built as part of the **Recursion by RSCOE** quiz platform.

---
