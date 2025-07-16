
# 📁 Project Management Backend

This is the **backend** service for a Project Management tool built with:

- 🧠 **Node.js + Express**
- 🔐 **JWT-based Authentication**
- 🧾 **MongoDB + Mongoose**
- 🛡 **TypeScript**
- 🌱 **Seeder script for test data**

---

## 📦 Requirements

Before running this project, make sure you have:

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (local or remote)
- npm or yarn

---

## ⚙️ Project Setup

### 1. **Install dependencies**
npm install


### 2. **Setup environment variables**

Create a `.env` file in the root and add:

MONGO_URI=mongodb://localhost:27017/project-manager
JWT_SECRET=your_jwt_secret
PORT=5000


> Replace values based on your local or production setup.

---

## 🚀 Available Scripts

### ▶️ Run in Development
npm run dev

Starts the server using `nodemon` and watches for TypeScript changes.

---

## 🌱 Seed the Database

The seeder script populates the database with:

- 👤 **1 user**  
  - Email: `test@example.com`  
  - Password: `Test@123`
- 📁 **2 projects** (linked to the user)
- ✅ **3 tasks** for each project

### 🔃 Run Seed Script
npm run seed

> This will connect to the MongoDB URI in your `.env`, wipe existing data, and reinsert test records.

---

## 🧪 Testing the API

Once the server is running:

- Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to test endpoints
- Use the credentials from the seeder to log in:  
  `test@example.com / Test@123`

---

