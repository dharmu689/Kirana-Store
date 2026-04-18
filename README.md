# AI Powered Smart Inventory Management System for Kirana Stores

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features & Modules](#features--modules)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Installation & Setup](#installation--setup)
9. [Workflow Diagrams](#workflow-diagrams)
10. [AI Components](#ai-components)
11. [Security Features](#security-features)
12. [Deployment](#deployment)
13. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

The **AI Powered Smart Inventory Management System** is a comprehensive, modern web application designed specifically for small retail businesses, particularly Kirana (grocery/convenience) stores. This system transforms traditional manual inventory management into an automated, intelligent, and data-driven process.

### Key Objectives
- **Automation**: Eliminate manual ledger entries and error-prone stock counts
- **Stock Optimization**: Proactively identify low-stock items and send alerts
- **AI-Driven Forecasting**: Predict future demand using historical sales patterns
- **Efficiency Improvement**: Streamline checkout, billing, and vendor communication
- **Data-Driven Decisions**: Provide real-time analytics and insightful reports

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend (React.js)"
        A[User Interface] --> B[Dashboard]
        A --> C[Product Management]
        A --> D[Sales/POS]
        A --> E[Vendor Management]
        A --> F[Reports & Analytics]
    end
    
    subgraph "AI Components"
        G[YOLOv8 Model]
        H[TensorFlow.js]
        I[Forecasting Algorithm]
    end
    
    subgraph "Backend (Node.js/Express)"
        J[API Server]
        K[Authentication]
        L[Business Logic]
        M[AI Processing]
    end
    
    subgraph "Database (MongoDB Atlas)"
        N[Users Collection]
        O[Products Collection]
        P[Sales Collection]
        Q[Vendors Collection]
        R[Orders Collection]
    end
    
    subgraph "External Services"
        S[Vercel Hosting]
        T[Render Hosting]
        U[Twilio SMS]
        V[Nodemailer]
    end
    
    A --> J
    G --> A
    H --> A
    I --> M
    J --> N
    J --> O
    J --> P
    J --> Q
    J --> R
    J --> U
    J --> V
    S --> A
    T --> J
```

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | ^19.2.0 | Core UI library for component-based interfaces |
| Vite | ^7.3.1 | Next-generation frontend tooling and build tool |
| Tailwind CSS | ^4.1.18 | Utility-first CSS framework for responsive styling |
| Framer Motion | ^12.34.3 | Production-ready animation library |
| Recharts | ^3.7.0 | Composable charting library for analytics |
| React Router | ^7.13.0 | Client-side routing and navigation |
| Axios | ^1.13.5 | HTTP client for API communication |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Asynchronous JavaScript runtime environment |
| Express.js | ^5.2.1 | Fast, minimalist web framework for REST APIs |
| MongoDB | ^9.2.1 | NoSQL database for flexible document storage |
| JWT | ^9.0.3 | JSON Web Tokens for authentication |
| bcryptjs | ^3.0.3 | Password hashing and security |
| Nodemailer | ^8.0.1 | Email sending functionality |
| Twilio | ^5.12.2 | SMS notifications and alerts |

### AI/ML Technologies
| Technology | Purpose |
|------------|---------|
| YOLOv8 | Real-time computer vision for product/barcode scanning |
| TensorFlow.js | Browser-based machine learning inference |
| Custom Algorithm | Demand forecasting and inventory optimization |

---

## ✨ Features & Modules

### 🏠 Dashboard Module
- **Real-time KPIs**: Total revenue, profit metrics, product count
- **Low Stock Alerts**: Automated notifications for critical items
- **Sales Analytics**: Interactive charts showing sales trends
- **Quick Actions**: One-click access to frequently used features

### 📦 Product Management Module
- **CRUD Operations**: Complete product lifecycle management
- **Category Management**: Organize products by categories
- **Stock Tracking**: Real-time inventory monitoring
- **Barcode Generation**: Automatic barcode creation for products
- **Bulk Operations**: Import/export products via Excel

### 💰 Sales & POS Module
- **Point of Sale**: Fast and efficient checkout process
- **AI Scanner**: Camera-based product identification
- **Cart Management**: Dynamic cart with real-time calculations
- **Receipt Generation**: Automatic bill and receipt creation
- **Profit Tracking**: Real-time profit calculation per sale

### 🤝 Vendor Management Module
- **Vendor Directory**: Comprehensive supplier database
- **Order Management**: Track purchase orders and deliveries
- **Vendor Comparison**: Compare prices and performance
- **Communication**: Integrated messaging with suppliers

### 📊 Reports & Analytics Module
- **Sales Reports**: Detailed sales analysis and trends
- **Profit Analysis**: Comprehensive profit tracking
- **Inventory Reports**: Stock movement and aging analysis
- **Visual Analytics**: Interactive charts and graphs

### 🔮 AI Forecasting Module
- **Demand Prediction**: AI-powered sales forecasting
- **Reorder Suggestions**: Intelligent stock replenishment recommendations
- **Trend Analysis**: Identify seasonal patterns and trends
- **Optimization**: Data-driven inventory optimization

---

## 📁 Project Structure

```
Kirana-Store/
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── layout/            # Layout components
│   │   │   ├── dashboard/         # Dashboard-specific components
│   │   │   ├── products/          # Product management components
│   │   │   └── ...                # Other component categories
│   │   ├── context/               # React Context providers
│   │   ├── pages/                 # Page-level components
│   │   ├── services/              # API service functions
│   │   ├── utils/                 # Utility functions
│   │   ├── App.jsx               # Main application component
│   │   └── main.jsx              # Application entry point
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js            # Vite configuration
├── server/                         # Backend Node.js Application
│   ├── config/                    # Configuration files
│   ├── controllers/               # Route controllers
│   ├── middleware/                # Custom middleware
│   ├── models/                    # MongoDB data models
│   ├── routes/                    # API route definitions
│   ├── services/                  # Business logic services
│   ├── scripts/                   # Utility scripts
│   ├── utils/                     # Server utilities
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Server entry point
├── docs/                          # Documentation files
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
└── README.md                      # Project documentation
```

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  storeName: String,
  role: String, // 'owner', 'manager', 'employee'
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  productId: String, // Unique product identifier
  name: String,
  category: String,
  purchasePrice: Number,
  sellingPrice: Number,
  margin: Number,
  profitPerUnit: Number,
  quantity: Number,
  reorderLevel: Number,
  suggestedOrder: Number, // AI-calculated
  barcode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Sale Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  receiptNumber: String,
  customerName: String,
  customerMobile: String,
  product: ObjectId, // Reference to Product
  productName: String,
  category: String,
  quantitySold: Number,
  unitPrice: Number,
  subtotal: Number,
  tax: Number,
  totalAmount: Number,
  profit: Number,
  paymentMethod: String,
  createdAt: Date
}
```

### Vendor Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  name: String,
  email: String,
  phone: String,
  address: String,
  products: [String], // Product categories
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Vendor Order Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  vendorId: ObjectId, // Reference to Vendor
  orderNumber: String,
  products: [{
    productId: ObjectId,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  totalAmount: Number,
  status: String, // 'pending', 'confirmed', 'delivered'
  orderDate: Date,
  deliveryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user info |

### Product Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/categories` | Get all categories |

### Sales Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | Get all sales |
| GET | `/api/sales/:id` | Get single sale |
| POST | `/api/sales` | Create new sale |
| GET | `/api/sales/reports` | Get sales reports |
| GET | `/api/sales/profit` | Get profit analysis |

### Vendor Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | Get all vendors |
| GET | `/api/vendors/:id` | Get single vendor |
| POST | `/api/vendors` | Create new vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Dashboard Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard summary |
| GET | `/api/dashboard/profits` | Get profit data |
| GET | `/api/dashboard/top-products` | Get top selling products |
| GET | `/api/dashboard/low-stock` | Get low stock products |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
touch .env

# Add environment variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kirana-store

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## 🔄 Workflow Diagrams

### User Registration & Login Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Enter registration details
    F->>B: POST /api/auth/register
    B->>DB: Check if user exists
    DB-->>B: User status
    B->>DB: Create new user
    DB-->>B: User created
    B->>B: Generate JWT token
    B-->>F: User data + token
    F->>F: Store token in localStorage
    F-->>U: Redirect to dashboard
```

### Sales Process Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant AI as AI Scanner
    
    U->>F: Start new sale
    U->>AI: Scan product barcode
    AI->>F: Product identified
    F->>B: GET /api/products/:id
    B->>DB: Fetch product
    DB-->>B: Product data
    B-->>F: Product details
    F->>F: Add to cart
    U->>F: Complete checkout
    F->>B: POST /api/sales
    B->>DB: Create sale record
    B->>DB: Update product quantity
    DB-->>B: Sale created & stock updated
    B-->>F: Success response
    F-->>U: Receipt generated
```

### AI Forecasting Process
```mermaid
flowchart TD
    A[Historical Sales Data] --> B[Data Aggregation]
    B --> C[Moving Average Calculation]
    C --> D[Seasonal Adjustment]
    D --> E[Trend Analysis]
    E --> F[Demand Prediction]
    F --> G[Reorder Suggestion]
    G --> H[Update Product Record]
    H --> I[Alert User if Needed]
    
    style A fill:#e1f5fe
    style G fill:#c8e6c9
    style I fill:#ffecb3
```

---

## 🤖 AI Components

### YOLOv8 Barcode Scanner
- **Purpose**: Real-time product identification using camera
- **Technology**: YOLOv8 model running in browser via TensorFlow.js
- **Workflow**:
  1. Access device camera via WebRTC
  2. Continuously process video frames
  3. Detect and localize barcodes/products
  4. Extract barcode data
  5. Match with product database
  6. Auto-add to POS cart

### Demand Forecasting Algorithm
- **Purpose**: Predict future product demand
- **Methodology**:
  1. **Historical Analysis**: Analyze past sales data
  2. **Moving Average**: Calculate 7/30-day averages
  3. **Seasonal Adjustment**: Account for seasonal patterns
  4. **Trend Detection**: Identify growth/decline trends
  5. **Reorder Calculation**: Generate optimal order quantities

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure API authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access**: Different access levels for users
- **Session Management**: Secure session handling

### Data Security
- **Tenant Isolation**: Each user sees only their data
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

### API Security
- **Rate Limiting**: Prevent API abuse
- **Error Handling**: Secure error responses
- **Data Validation**: Request/response validation
- **HTTPS Only**: Encrypted communication

---

## Deployed Application

### Live Deployment URLs
- **Frontend**: https://kirana-store-tau.vercel.app/
- **Backend**: [Render Backend URL] *(Deployed)*

### Deployment Status
| Component | Platform | Status | URL |
|-----------|----------|--------|-----|
| Frontend | Vercel | **Live** | https://kirana-store-tau.vercel.app/ |
| Backend | Render | **Live** | Deployed on Render |
| Database | MongoDB Atlas | **Live** | Cloud Cluster |

---

## 🌐 Deployment

### Frontend Deployment (Vercel)
```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend Deployment (Render)
```bash
# Deploy backend to Render
# Connect GitHub repository
# Set environment variables
# Deploy automatically on push
```

### Database Setup (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create new cluster
3. Configure network access
4. Create database user
5. Get connection string
6. Update environment variables

---

## 🚀 Future Enhancements

### Planned Features
- **Mobile App**: React Native for iOS/Android
- **Offline Mode**: PWA capabilities for offline operations
- **Multi-Store Support**: Manage multiple store locations
- **Advanced AI**: LSTM neural networks for better forecasting
- **Visual Recognition**: Product recognition without barcodes
- **Dynamic Pricing**: AI-based price optimization
- **Vendor Integration**: Direct API integration with suppliers

### Technology Upgrades
- **Microservices**: Split into microservice architecture
- **GraphQL**: Replace REST with GraphQL API
- **Redis**: Add caching layer for performance
- **Docker**: Containerize application deployment
- **CI/CD**: Automated testing and deployment pipeline

---

## 📞 Support & Contact

For support, feature requests, or bug reports:
- **Email**: support@kirana-store.com
- **GitHub**: [Project Repository](https://github.com/username/kirana-store)
- **Documentation**: [Full Documentation](./docs/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **MongoDB**: For the excellent database solution
- **Vercel & Render**: For hosting services
- **Open Source Community**: For all the amazing libraries and tools

---

*Last Updated: April 2026*
