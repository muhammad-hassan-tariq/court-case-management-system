# Court Case Management System

A full-stack web application for managing court cases, hearings, judges, and user authentication. The system provides a centralized interface for managing case information and related court records through a Node.js/Express.js backend connected to Microsoft SQL Server.

## Features

* User authentication and login
* Court case management
* Add, view, update, and delete cases
* Hearing management
* Judge management
* Case search and filtering
* Case status tracking
* Dashboard statistics
* Recent cases and upcoming hearings
* Responsive user interface
* Microsoft SQL Server database integration
* REST API backend

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* REST API

### Database

* Microsoft SQL Server

### Tools

* Visual Studio Code
* SQL Server Management Studio
* Git
* GitHub

## System Architecture

```text
Frontend
HTML + CSS + JavaScript
        |
        | HTTP Requests
        ↓
Node.js + Express.js
        |
        | SQL Queries
        ↓
Microsoft SQL Server
```

## Main Modules

### Cases

Manage court case records, including case information and status.

### Hearings

Manage hearing records associated with court cases.

### Judges

Manage judge information used within the court case system.

### Authentication

Provides login functionality for authorized users.

## Project Structure

```text
CourtCaseManagementSystem/
│
├── Frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── caseController.js
│   ├── hearingController.js
│   └── judgeController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── auth.js
│   ├── cases.js
│   ├── hearings.js
│   └── judges.js
│
├── package.json
├── package-lock.json
├── server.js
└── .gitignore
```

## Database

The application uses Microsoft SQL Server with the database:

```text
CourtCaseDB
```

The system manages multiple related entities, including:

* Users
* Cases
* Hearings
* Judges

Database configuration is stored using environment variables and is not included in the public repository.

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/muhammad-hassan-tariq/court-case-management-system.git
```

### 2. Open the project

```bash
cd court-case-management-system
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```text
DB_SERVER=localhost
DB_NAME=CourtCaseDB
DB_PORT=1433
DB_USER=your_username
DB_PASSWORD=your_password
```

Use your own local SQL Server credentials.

### 5. Start the application

```bash
node server.js
```

Make sure Microsoft SQL Server is running and the `CourtCaseDB` database is available.

## Screenshots
### Dashboard

![Court Case Management System Dashboard](screenshots/Dashboard(2).png)

### Case Management

![Case Management](screenshots/Cases.png)

### Hearing Management

![Hearing Management](screenshots/Hearings.png)

### Judges Management

![Judges Management](screenshots/judges.png)


## Future Improvements

* Password hashing
* Role-based access control
* Improved authentication security
* Case document management
* Advanced reporting
* Cloud deployment

## Author

**Muhammad Hassan Tariq**

Information Technology Student

GitHub: https://github.com/muhammad-hassan-tariq

LinkedIn: https://www.linkedin.com/in/muhammad-hassan-tariq-
