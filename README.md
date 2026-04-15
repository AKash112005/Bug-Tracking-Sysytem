🐞 Bug Tracking System

    A Role-Based Bug Tracking System built using modern web technologies to manage, track, and resolve software bugs efficiently.
    
    This application allows Admins, Developers, Testers, and Viewers to collaborate in a structured workflow.

🚀 Features

🔐 Authentication & Authorization

    Secure login system
    
    Role-based access control (RBAC)

👨‍💼 Admin Dashboard

    Create & manage users
    
    Assign roles
    
    Monitor system-wide bug reports

👨‍💻 Developer Dashboard
  
    View assigned bugs
    
    Update bug status
    
    Mark bugs as resolved

🧪 Tester Dashboard

    Create new bug reports
    
    Verify resolved bugs
    
    Update bug status

👀 Viewer Dashboard

    Read-only access to bug reports

📊 Bug Status Workflow

    Open
    
    In Progress
    
    Resolved
    
    Closed

🛠️ Tech Stack

    Frontend
    
    React.js
    
    React Router DOM
    
    CSS / Bootstrap (if used)
    
    Backend (Update if applicable)
    
    Node.js
    
    Express.js
    
    MongoDB
    
    Authentication
    
    JWT (JSON Web Token)

📂 Project Structure
    bug-tracking-system/
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   │   └── Navbar.jsx
    │   │   ├── pages/
    │   │   │   ├── admindashboard.jsx
    │   │   │   ├── developerdashboard.jsx
    │   │   │   ├── testerdashboard.jsx
    │   │   │   ├── viewerdashboard.jsx
    │   │   │   └── login.jsx
    │   │   ├── utils/
    │   │   │   └── auth.js
    │   │   └── App.jsx
    │
    ├── backend/
    │   ├── models/
    │   ├── routes/
    │   ├── controllers/
    │   └── server.js
    │
    └── README.md
🔑 Role-Based Access Flow

    User logs in.
    
    System verifies authentication.
    
    Based on user role:
    
    Admin → Admin Dashboard
    
    Developer → Developer Dashboard
    
    Tester → Tester Dashboard
    
    Viewer → Viewer Dashboard
    
    Unauthorized access is restricted using Protected Routes.

⚙️ Installation & Setup

  1️⃣ Clone the Repository
    git clone https://github.com/AKash112005/Bug-Tracking-Sysytem 
    cd bug-tracking-system
  2️⃣ Setup Frontend
    cd frontend
    npm install
    npm start
    
    Runs on:
    
    http://localhost:3000
  3️⃣ Setup Backend
    cd backend
    npm install
    npm run dev
    
    Runs on:
    
    http://localhost:5000
🔐 Environment Variables (Backend)

    Create a .env file inside backend folder:
    
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    
  
  📌 Future Enhancements

    Email Notifications
    
    File Attachments for Bugs
    
    Bug Priority Levels (Low, Medium, High, Critical)
    
    Analytics Dashboard
    
    Docker Deployment
    
    CI/CD Integration
