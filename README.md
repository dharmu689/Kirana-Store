# AI-Powered Smart Inventory Management System for Kirana Stores

A comprehensive, modern web application tailor-made for small retail businesses, particularly *Kirana* (grocery/convenience) stores. It provides a centralized digital platform to manage products, record sales, handle vendors, and automate the reordering process with AI-backed demand forecasting and intelligent product scanning.

## 🌟 Key Features

- **Automated Inventory Management:** Eliminates manual ledger entries and error-prone stock counts.
- **AI-Driven Forecasting:** Utilizes historical sales patterns to predict future demand and determine optimal reorder quantities.
- **Barcode / AI Product Scanning:** YOLOv8/TensorFlow.js driven real-time computer vision for interactive product scanning directly from a standard web or mobile camera.
- **Smart Reorder Automation:** Suggests orders based on low-stock triggers and AI-calculated forecasting.
- **Point of Sale (POS):** Efficient cart management and fast checkout process with dynamic total calculations.
- **Advanced Dashboard & Analytics:** Real-time visual tracking of revenue, low stock alerts, and top-selling products using Recharts.
- **Vendor Management:** Keep a directory of suppliers and process purchase orders seamlessly.

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **AI Integration:** YOLOv8, TensorFlow.js
- **Deployment:** Vercel (Frontend), Render (Backend)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16.x or higher recommended)
- npm or yarn package manager
- MongoDB Atlas account (for database setup)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Kirana-Store
```

### 2. Install Dependencies

Install the frontend dependencies:
```bash
npm install
```

Install the backend dependencies:
```bash
cd server
npm install
cd ..
```

### 3. Environment Variables Setup

Create a `.env` file in the `server` directory and a `.env.local` in the root (for frontend) based on the required configurations.

**Backend (`server/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Frontend (`.env.local`):**
```env
VITE_API_URL=http://localhost:5000/api
```
*(Adjust the API URL based on your server settings or deployment)*

### 4. Running the Application locally

Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend Vite development server:
```bash
# In the root directory (Kirana-Store)
npm run dev
```

The application will now be running at `http://localhost:5173`.

## 🏗️ System Architecture

The application follows a decoupled client-server architecture:
- **Client (React.js):** Provides a responsive Single Page Application (SPA). Hardware-accelerated AI models run locally via TensorFlow.js for computer vision tasks in the browser without server roundtrips.
- **Server (Node.js/Express.js):** Manages API endpoints, business logic, algorithmic demand forecasting (historical data parsing), and securely processes database transactions using tenant isolation.
- **Database (MongoDB):** Flexible NoSQL document database storing products, users, automated forecasts, and vendor records.

## 🔮 Future Scope

- **Mobile POS Application:** Native mobile application (via React Native) to support seamless offline checkout.
- **Advanced ML Forecasting:** Implementing Recurrent Neural Networks (RNNs/LSTMs) for complex temporal predictions.
- **Dynamic Pricing:** AI-based demand optimization adjusting prices based on expiry dates or slow inventory flow.
- **Multi-Store Management:** Unified admin dashboards for businesses operating multiple franchise branches.
- **Supplier Marketplace Integration:** Directly order from regional wholesalers inside the application.

---
*Built with ❤️ to accelerate local retail businesses with the power of artificial intelligence.*
