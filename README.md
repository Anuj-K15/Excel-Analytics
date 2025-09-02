# Excel Analytics Platform

A comprehensive platform for uploading, analyzing, and visualizing Excel data with advanced analytics features.

## Deployment Links

- **Frontend**: [https://excel-analytics-anuj.vercel.app/](https://excel-analytics-anuj.vercel.app/)
- **Backend**: [https://excelanalytics-backend-1y12.onrender.com](https://excelanalytics-backend-1y12.onrender.com)

## Project Overview

Excel Analytics is a web application designed to help users upload Excel files, analyze the data, and visualize insights through interactive charts and reports. The platform offers both 2D and 3D visualization capabilities, historical tracking of analyses, and secure user authentication.

## Features

- **User Authentication**: Register, login, and Google Sign-in options
- **Excel File Upload**: Upload Excel files for analysis
- **Data Analysis**: Advanced data processing and analytics
- **Interactive Visualizations**: Both 2D charts and 3D visualizations
- **Historical Reports**: Track and revisit past analyses
- **Admin Panel**: Manage users and monitor platform usage

## Tech Stack

### Frontend
- React.js
- Three.js for 3D visualizations
- Firebase Authentication
- Tailwind CSS
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB for data storage
- Multer for file uploads
- JSON Web Tokens for authentication

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   ├── src/                # Source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Application pages
│   │   ├── App.js          # Main application component
│   │   └── firebase.js     # Firebase configuration
│   └── package.json        # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded files storage
│   └── server.js           # Main server file
└── vercel.json             # Vercel deployment configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB instance

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/Anuj-K15/Excel-Analytics.git
   cd Excel-Analytics
   ```

2. Set up the frontend:
   ```
   cd client
   npm install
   cp .env.example .env  # Create and configure environment variables
   npm start
   ```

3. Set up the backend:
   ```
   cd server
   npm install
   cp .env.example .env  # Create and configure environment variables
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Frontend
The frontend is deployed on Vercel. To deploy your own instance:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables
3. Set the build command to `cd client && npm install && npm run build`

### Backend
The backend is deployed on Render. To deploy your own instance:

1. Connect your GitHub repository to Render
2. Configure the environment variables
3. Set the build command to `cd server && npm install`
4. Set the start command to `cd server && node server.js`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- [Anuj K](https://github.com/Anuj-K15) - Developer

## Acknowledgments

- Thanks to all the open-source libraries and frameworks that made this project possible
