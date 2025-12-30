

# RouteOpt – Order Dispatch & Route Optimization System

RouteOpt is a logistics-focused web application that intelligently assigns delivery orders to drivers based on distance and real-world constraints such as vehicle type, weight capacity, and fragile item handling.

---

## Features

- Smart order-to-driver assignment
- Distance-based optimization using Haversine formula
- Constraint checks:
  - Vehicle type compatibility
  - Maximum weight capacity
  - Fragile item handling
- Multiple drivers and multiple orders per driver
- Persistent assignments using MongoDB

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

---

## Project Structure
```
RouteOpt/
├── backend/
│ ├── models/
│ ├── routes/
│ └── index.js
├── frontend/
│ ├── src/
│ ├── pages/
│ ├── shared/
│ ├── state/
│ ├── index.css
│ └── main.jsx
├── index.html
└── README.md
```

## How to Run Locally

### Clone the repository
```bash
git clone https://github.com/<your-username>/RouteOpt.git
cd RouteOpt
```

### Backend setup
```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
PORT=4000
```


### Frontend setup
```bash
cd frontend
npm install
npm run dev
```
