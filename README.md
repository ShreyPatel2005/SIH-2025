# Ayush Terminology & EMR Integration Platform

A comprehensive medical terminology management platform built with React and Tailwind CSS for the Ministry of Ayush. This application manages and maps medical coding systems (NAMASTE and ICD-11) and prepares data for EMR integration.

## Features

### 🏥 Core Functionality
- **Dashboard**: Central hub with navigation to all major features
- **Ingest Coding Systems**: Upload NAMASTE CSV files and configure WHO ICD-11 API
- **Search & Map Codes**: Find terms across coding systems and visualize mappings
- **Upload EMR Data**: Submit FHIR bundles for patient data integration

### 🔍 Search & Mapping
- Real-time search across multiple coding systems:
  - NAMASTE
  - ICD-11 TM2
  - ICD-11 Biomedicine
  - WHO Ayurveda
- Visual mapping between NAMASTE and ICD-11 codes
- FHIR ProblemList/Condition resource generation
- One-click JSON copying for easy integration

### 🎨 Modern UI/UX
- Clean, professional design inspired by shadcn/ui
- Responsive layout that works on all devices
- Intuitive navigation with persistent sidebar
- Loading states and user feedback
- Accessible form controls and interactions

## Technology Stack

### Frontend
- **Framework**: React 18+ with functional components and hooks
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for CSV processing
- **CORS**: Cross-origin resource sharing enabled

### Development
- **Hot Reload**: Both frontend and backend support hot reloading
- **Concurrent Development**: Run both services with a single command
- **Environment Configuration**: Separate configs for development and production

## Getting Started

### Prerequisites
- **Node.js 16+** 
- **MongoDB 5.0+** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Quick Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ayush-terminology-portal
```

2. **Install all dependencies:**
```bash
npm run setup
```

3. **Start MongoDB** (if using local installation):
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

4. **Start both frontend and backend:**
```bash
npm run dev:full
```

5. **Access the application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/health`

### Alternative Setup

If you prefer to start services separately:

```bash
# Terminal 1 - Start backend
npm run server:dev

# Terminal 2 - Start frontend  
npm run dev
```

For detailed setup instructions, see [SETUP.md](SETUP.md).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── App.jsx          # Main application component
├── main.jsx         # Application entry point
└── index.css        # Global styles and Tailwind imports
```

## Usage Guide

### 1. Dashboard
The main page provides quick access to all features through a 2x2 grid of cards. Click any card to navigate to the corresponding feature.

### 2. Ingest Coding Systems
- **NAMASTE Upload**: Select and upload a CSV file containing NAMASTE terminology data
- **ICD-11 API Configuration**: Set up the WHO ICD-11 API endpoint for synchronization

### 3. Search & Map Codes
- Enter search terms in the search bar
- Select the coding system to search within
- Click on NAMASTE results to view mappings
- Generate FHIR JSON for selected mappings
- Copy generated JSON for EMR integration

### 4. Upload EMR Data
- Fill in patient ABHA ID and clinician HPR ID
- Add encounter notes
- Upload a FHIR bundle JSON file
- Submit the data for processing

## Database Integration

The application now includes full MongoDB integration with the following features:

### Database Collections
- **Terminology**: Stores medical terms from all coding systems
- **Mapping**: Stores relationships between different coding systems
- **EMRData**: Stores submitted EMR data and processing results

### Real API Endpoints
- **Search**: `GET /api/v1/terminology/search?system={system}&query={query}`
- **Mapping**: `GET /api/v1/mapping/{code}`
- **EMR Submit**: `POST /api/v1/emr/submit`
- **File Upload**: `POST /api/v1/upload/namaste`

### Sample Data
The application automatically initializes with sample NAMASTE, ICD-11, and mapping data for immediate testing.

## FHIR Resource Generation

The application generates FHIR Condition resources with multiple coding systems:

```json
{
  "resourceType": "Condition",
  "id": "condition-1234567890",
  "subject": { "reference": "Patient/example" },
  "encounter": { "reference": "Encounter/example" },
  "code": {
    "coding": [
      {
        "system": "http://namaste.gov.in",
        "code": "NAM-A01.1",
        "display": "Vataja Jvara"
      },
      {
        "system": "http://id.who.int/icd/entity/148929940",
        "code": "JA20.0",
        "display": "Qi-Phase Wind-Heat Pattern"
      }
    ]
  }
}
```

## Customization

### Styling
The application uses a custom design system defined in `tailwind.config.js`. Colors and components can be customized by modifying the CSS variables in `src/index.css`.

### Adding New Coding Systems
To add support for additional coding systems:

1. Update the `selectedSystem` options in the search view
2. Add mock data to the `apiService.search` function
3. Update the FHIR generation logic to include the new system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the Ministry of Ayush development team.
