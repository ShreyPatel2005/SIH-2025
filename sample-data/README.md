# Sample Coding System Data Files

This directory contains sample CSV files for testing the Ayush Terminology Portal with different medical coding systems.

## 📁 Available Files

### 1. **namaste-terminology.csv** (51 terms)
- **System**: NAMASTE (National Ayurvedic Medical Association Standardized Terminology)
- **Content**: Ayurvedic medical terms organized by dosha types (Vata, Pitta, Kapha, Sannipata)
- **Categories**: Fever, Digestive, Respiratory, Cardiovascular, Hematological, Hepatobiliary, Genitourinary, Dermatology, Ophthalmology, ENT, Neurological, Musculoskeletal, Endocrine, General

### 2. **icd11-biomedicine.csv** (50 terms)
- **System**: ICD-11 Biomedicine (International Classification of Diseases, 11th Revision)
- **Content**: Modern biomedical terminology and disease classifications
- **Categories**: Fever, Digestive, Respiratory, Cardiovascular, Hematological, Hepatobiliary, Genitourinary, Dermatology, Ophthalmology, ENT, Neurological, Musculoskeletal, Endocrine, Mental Health, Sleep Disorders

### 3. **who-ayurveda.csv** (86 terms)
- **System**: WHO Ayurveda (World Health Organization Ayurvedic terminology)
- **Content**: International Ayurvedic terminology standards
- **Categories**: Comprehensive Ayurvedic medical terms with dosha classifications

### 4. **terminology-mappings.csv** (45 mappings)
- **Purpose**: Cross-system mappings between NAMASTE and other coding systems
- **Content**: Relationships between terms across different coding systems
- **Mapping Types**: exact, broad, narrow, related
- **Confidence Scores**: 0.0 to 1.0

## 🚀 How to Upload and Test

### Step 1: Start the Application
```bash
npm run dev:full
```

### Step 2: Upload Terminology Files
1. Go to **"Ingest Coding Systems"** in the dashboard
2. Upload each CSV file one by one:
   - `namaste-terminology.csv`
   - `icd11-biomedicine.csv` 
   - `who-ayurveda.csv`

### Step 3: Test Search Functionality
1. Go to **"Search & Map Codes"**
2. Select different coding systems from the dropdown
3. Search for terms like:
   - "Jvara" (fever)
   - "Atisara" (diarrhea)
   - "Kasa" (cough)
   - "Hridroga" (heart disease)

### Step 4: Test Mapping Functionality
1. Search for NAMASTE terms
2. Click on any NAMASTE result to view mappings
3. Generate FHIR JSON from the mappings

## 📊 Expected Results After Upload

### Terminology Counts:
- **NAMASTE**: 51 terms
- **ICD-11 Biomedicine**: 50 terms  
- **WHO Ayurveda**: 86 terms
- **Total**: 187 medical terms

### Available Systems:
After upload, you should see these systems in the search dropdown:
- NAMASTE
- ICD-11 Biomedicine
- WHO Ayurveda

### Sample Mappings:
- NAM-A01.1 (Vataja Jvara) → AYU-016 (Vataja Jvara) + MG2A.01 (Fever of unknown origin)
- NAM-A01.2 (Vataja Atisara) → AYU-020 (Vataja Atisara) + DD90 (Acute diarrhoea)

## 🔍 Sample Search Queries

### Fever-related terms:
- "Jvara" - Find all fever-related terms
- "Fever" - Find modern fever classifications
- "NAM-A01" - Find NAMASTE fever codes

### Digestive system:
- "Atisara" - Find diarrhea terms
- "Diarrhoea" - Find modern diarrhea classifications
- "Digestive" - Find all digestive system terms

### Respiratory system:
- "Kasa" - Find cough terms
- "Shwasa" - Find breathing difficulty terms
- "Respiratory" - Find all respiratory terms

## 🎯 Testing Scenarios

### 1. **Basic Search Test**
- Search for "Jvara" in NAMASTE system
- Should return multiple fever-related terms

### 2. **Cross-System Mapping Test**
- Search for "NAM-A01.1" (Vataja Jvara)
- Click on the result to view mappings
- Should show mappings to WHO Ayurveda and ICD-11 Biomedicine

### 3. **FHIR Generation Test**
- Select a NAMASTE term with mappings
- Generate FHIR JSON
- Should create a proper FHIR Condition resource

### 4. **System Statistics Test**
- Check that all three systems appear in the search dropdown
- Verify term counts are correct

## 🛠️ Customization

### Adding New Terms:
1. Edit any CSV file
2. Follow the format: `term,code,description,category`
3. Ensure unique codes within each system
4. Re-upload the modified file

### Adding New Mappings:
1. Edit `terminology-mappings.csv`
2. Add new mapping relationships
3. Use appropriate mapping types and confidence scores

### Adding New Systems:
1. Create a new CSV file with your system's terms
2. Upload it through the application
3. The system will automatically detect the new coding system

## 📝 CSV File Format

### Terminology Files:
```csv
term,code,description,category
Vataja Jvara,NAM-A01.1,Fever caused by Vata dosha imbalance,Fever
```

### Mapping Files:
```csv
source_system,source_code,source_term,target_system,target_code,target_term,mapping_type,confidence
NAMASTE,NAM-A01.1,Vataja Jvara,ICD-11 Biomedicine,MG2A.01,Fever of unknown origin,broad,0.8
```

## 🔧 Troubleshooting

### Upload Issues:
- Ensure CSV files use UTF-8 encoding
- Check that required columns are present
- Verify unique codes within each system

### Search Issues:
- Clear browser cache if systems don't appear
- Check browser console for API errors
- Verify backend server is running

### Mapping Issues:
- Ensure source codes exist in the database
- Check mapping file format
- Verify system names match exactly

## 📚 Next Steps

After testing with these sample files:

1. **Upload your real terminology data**
2. **Create custom mappings** between your systems
3. **Configure external APIs** for real-time synchronization
4. **Test EMR data submission** with FHIR bundles
5. **Generate production reports** from your terminology database

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the backend server logs
3. Ensure MongoDB is connected
4. Check that all required fields are present in CSV files
