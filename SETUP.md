# Ayush Terminology Portal - Setup Guide

This guide will help you set up the complete Ayush Terminology Portal with MongoDB integration.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**

## MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Download and Install MongoDB Community Edition**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download and install MongoDB Community Edition for your operating system

2. **Start MongoDB Service**
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS (with Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

3. **Verify Installation**
   ```bash
   mongosh --version
   ```

### Option 2: MongoDB Atlas (Cloud) ✅ **CONFIGURED**

Your MongoDB Atlas cluster is already configured! The application will connect to:

```
mongodb+srv://Shrey:gqW7H2aw8PBhTYAP@cluster0.q25cjkt.mongodb.net/ayush_terminology
```

**No additional setup required** - the connection string is already configured in `server/config.js`.

## Project Setup

### 1. Install Dependencies

Run the setup command to install all dependencies:

```bash
npm run setup
```

This will install dependencies for both frontend and backend.

### 2. Environment Configuration ✅ **CONFIGURED**

Your MongoDB Atlas connection is already configured in `server/config.js`. No environment file setup needed!

### 3. Start the Application

#### Option A: Start Both Frontend and Backend Together

```bash
npm run dev:full
```

This will start:
- Backend API server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

#### Option B: Start Services Separately

**Terminal 1 - Start Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

## Verification

### 1. Check Backend API

Visit `http://localhost:5000/health` - you should see:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "Connected",
  "version": "1.0.0"
}
```

### 2. Check Frontend

Visit `http://localhost:3000` - you should see the Ayush Terminology Portal dashboard.

### 3. Test Database Connection

The backend will automatically:
- Connect to MongoDB
- Create the database `ayush_terminology`
- Initialize sample data (terminology and mappings)

## Database Schema

The application creates three main collections:

### 1. Terminology Collection
- Stores medical terminology from different systems (NAMASTE, ICD-11, etc.)
- Fields: `term`, `code`, `system`, `description`, `category`

### 2. Mapping Collection
- Stores mappings between different coding systems
- Fields: `sourceTerm`, `mappedTerms`, `mappingStatus`, `confidence`

### 3. EMRData Collection
- Stores submitted EMR data and processing results
- Fields: `patientId`, `clinicianId`, `fhirBundle`, `processedTerms`

## API Endpoints

The backend provides the following API endpoints:

### Terminology
- `GET /api/v1/terminology/search` - Search terminology
- `GET /api/v1/terminology/:id` - Get single terminology
- `POST /api/v1/terminology` - Create terminology
- `PUT /api/v1/terminology/:id` - Update terminology

### Mapping
- `GET /api/v1/mapping/:code` - Get mapping for a code
- `POST /api/v1/mapping` - Create mapping
- `GET /api/v1/mapping` - List mappings

### EMR Data
- `POST /api/v1/emr/submit` - Submit EMR data
- `GET /api/v1/emr/:id` - Get EMR data
- `GET /api/v1/emr/patient/:patientId` - Get patient EMR data

### Upload
- `POST /api/v1/upload/namaste` - Upload NAMASTE CSV
- `POST /api/v1/upload/icd11-config` - Configure ICD-11 API

## Sample Data

The application automatically creates sample data including:

- **NAMASTE Terms**: Vataja Jvara, Vataja Atisara, etc.
- **ICD-11 Terms**: Qi-Phase Wind-Heat Pattern, Fever of unknown origin, etc.
- **Mappings**: NAMASTE to ICD-11 mappings

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `server/config.js`
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use**
   - Change ports in configuration files
   - Kill existing processes on those ports

3. **CORS Errors**
   - Ensure frontend URL is correctly configured
   - Check CORS settings in `server/config.js`

4. **File Upload Issues**
   - Ensure `server/uploads/` directory exists
   - Check file size limits (default: 10MB)

### Logs

- **Backend logs**: Check terminal running the server
- **Frontend logs**: Check browser console
- **Database logs**: Check MongoDB logs

## Development

### Adding New Features

1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Update `src/App.jsx`
3. **Database**: Update models in `server/models/`

### Database Management

```bash
# Connect to MongoDB shell
mongosh

# Use the application database
use ayush_terminology

# View collections
show collections

# Query data
db.terminology.find().limit(5)
db.mapping.find().limit(5)
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or production MongoDB instance
3. Configure proper CORS settings
4. Set up SSL certificates
5. Use process managers like PM2
6. Set up monitoring and logging

## Support

For issues and questions:
- Check the logs for error messages
- Verify all prerequisites are installed
- Ensure MongoDB is running and accessible
- Check network connectivity between frontend and backend

## Next Steps

Once the application is running:

1. **Upload NAMASTE Data**: Use the ingest feature to upload CSV files
2. **Configure ICD-11**: Set up WHO ICD-11 API endpoint
3. **Search & Map**: Use the search functionality to find and map terms
4. **Submit EMR Data**: Test the EMR data submission feature
5. **Generate FHIR**: Create FHIR resources from mappings
