<<<<<<< HEAD
# task4-auth-app
=======
# Task 4 - Fullstack Authentication App (PostgreSQL)

This is a full-stack authentication and user management app built with:

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 14



## ✅ Features

- User **Registration** & **Login**
- JWT-based **authentication**
- Display list of users
- Select one or more users
- Block / Unblock users
- Delete users (logical delete using `is_deleted`)
- Prevent access to blocked/deleted users (auto-logout on block)
- Select **all users**, including the currently logged-in one
- Block **all users**, including self
- Enforces **unique email constraint**
- Displays error if duplicate email used during signup
- Index on `email` is demonstrated in the video



## 📦 Technologies

| Layer      | Tech                       |
|------------|----------------------------|
| Frontend   | React, Tailwind CSS        |
| Backend    | Node.js, Express           |
| Database   | PostgreSQL 13/14           |
| Auth       | JWT, bcrypt                |



## 📁 Folder Structure

Task 4/
├── backend/
│ ├── controllers/
│ │ └── authController.js
│ ├── db/
│ │ └── db.js
│ ├── middleware/
│ │ └── checkUserStatus.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ └── userRoutes.js
│ └── server.js
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── auth/
│ │ │ │ ├── LoginForm.js
│ │ │ │ └── SignupForm.js
│ │ │ ├── users/
│ │ │ │ └── UserList.js
│ │ │ └── common/
│ │ │ └── NavigationHeader.js
│ │ └── App.js
│ └── tailwind.config.js
├── README.md
└── .env




## 🔐 .env Example

In the backend folder, create a `.env` file:

```env
JWT_SECRET=your_super_secret_key


CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  is_blocked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


🚫 Unique Email Index Demo
The app has a unique index on the email field in the database.

If a user tries to sign up with an already used email:

Backend catches the error

Frontend displays: "Email already in use"

📌 This fulfills the requirement to demonstrate the unique constraint & error handling.


🚀 Run the App
Backend
cd backend
npm install
node server.js

Frontend
cd frontend
npm install
npm start



👤 Author
Adriana Bazan
GitHub: @bazanadriana
>>>>>>> f4b8a4a (Initial commit for Task 4 fullstack auth app)
