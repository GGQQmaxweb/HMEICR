# HMEICR Project

HMEICR (Household Expense & E-Invoice Management) is a web application for tracking receipts and integrating with the Taiwan E-Invoice platform.

## Architecture

*   **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Served via Vite)
*   **Backend**: Python Flask
*   **Database**: MongoDB
*   **Containerization**: Docker Compose

## Features

*   **User Authentication**: Register, Login, Logout (Secure Session & Password Hashing).
*   **Receipt Management**:
    *   Add Receipts (Title, Amount, Currency, Date).
    *   List Receipts.
    *   **Edit Receipts** (Update details).
    *   **Delete Receipts** (With confirmation).
*   **Analytics**: View **Total Amount** for the current month.
*   **UI/UX**:
    *   Clean, Responsive Design.
    *   **Dark Mode** (Global toggle).
    *   Interactive Modals.

## Documentation

Comprehensive documentation is available in the `docs/` directory:

*   [API Specification](docs/api-spec.md)
*   [Architecture Diagram](docs/architecture.md)
*   [System Flowchart](docs/flowchart.md)

## Getting Started

### Prerequisites

*   Docker & Docker Compose

### Setup & Run (Recommended)

1.  **Clone the repository**.
2.  **Create `.env` file** in the root directory:
    ```env
    MONGO_URI=mongodb://root:password123@mongodb:27017/myapp?authSource=admin
    EINVOICE_SECRET_KEY=your_generated_secret_key
    secret_key=your_flask_secret_key
    ```
3.  **Run with Docker Compose**:
    ```bash
    docker compose up --build
    ```
4.  **Access the application**:
    *   Frontend: `http://localhost:5173` (Proxies API requests to backend)
    *   Backend API: `http://localhost:8080` (Internal port 5000 mapped to 8080)

### Manual Setup (Development)

#### Backend
1.  Install dependencies: `pip install -r requirements.txt`
2.  Run MongoDB locally on port 27017.
3.  Start Server: `python server.py` (Runs on port 5000).

#### Frontend
1.  Navigate to client: `cd client`
2.  Install dependencies: `npm install`
3.  Start Dev Server: `npm run dev`
