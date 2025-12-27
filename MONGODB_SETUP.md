# MongoDB Integration Guide

## 📋 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` file in root directory (copy from `.env.example`):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sv5t_database?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
DB_NAME=sv5t_database
```

### 3. Get MongoDB Connection String

**Option A: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `username` and `password` with your credentials
7. Paste into `MONGODB_URI`

**Option B: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/sv5t_database
```
(Make sure MongoDB is running locally)

### 4. Run Server
```bash
# Development (auto-reload)
npm run server:dev

# Production
npm run server
```

✅ Server running on `http://localhost:5000`

---

## 🚀 API Endpoints

### Students API

#### Get all students
```bash
GET /api/students/all?faculty=KHMT&academicYear=2024&status=eligible
```

#### Get single student
```bash
GET /api/students/{id}
```

#### Create student
```bash
POST /api/students
Content-Type: application/json

{
  "mssv": "2024001",
  "fullName": "Nguyễn Văn A",
  "email": "a@student.edu.vn",
  "faculty": "KHMT",
  "academicYear": 2024,
  "studentType": "chính quy",
  "gpa": 3.8,
  "trainingPoints": 85,
  "hardCriteria": {
    "academicPerformance": true,
    "trainingExcellence": true,
    "volunteerWork": true,
    "skillsDevelopment": true,
    "communityContribution": false
  },
  "softCriteria": {
    "academicEnrichment": 6,
    "leadershipInitiative": 5,
    "articulateCommunication": 4,
    "socialResponsibility": 5
  }
}
```

#### Update student
```bash
PUT /api/students/{id}
Content-Type: application/json

{
  "gpa": 3.9,
  "evaluationResult": {
    "status": "eligible",
    "readinessScore": 95,
    "confidence": 0.95
  }
}
```

#### Delete student
```bash
DELETE /api/students/{id}
```

#### Get students by faculty
```bash
GET /api/students/faculty/KHMT
```

#### Get statistics
```bash
GET /api/students/statistics?academicYear=2024&faculty=KHMT
```

---

### Analytics API

#### Analyze dataset
```bash
GET /api/analytics/analyze?academicYear=2024&faculty=KHMT
```

Returns:
- Total students, eligible/almost ready/not eligible count
- Average GPA and training points
- Pass rate
- Hard criteria pass rates
- Soft criteria averages
- Correlation analysis

#### Get dataset for ML
```bash
GET /api/analytics/dataset-ml?academicYear=2024
```

Returns ML-ready format:
```json
[
  {
    "id": "...",
    "mssv": "2024001",
    "hardCriteria": [1, 1, 0, 1, 0],
    "softCriteria": [6, 5, 4, 5],
    "gpa": 3.8,
    "trainingPoints": 85,
    "evidenceCount": 15,
    "approvedEvidenceCount": 14,
    "label": 1,
    "confidence": 0.95
  }
]
```

#### Export dataset to CSV
```bash
GET /api/analytics/export-csv?academicYear=2024
```

Downloads CSV file with all student data

#### Save analytics report
```bash
POST /api/analytics/save-report
Content-Type: application/json

{
  "academicYear": 2024,
  "faculty": "KHMT",
  "totalStudents": 250,
  "eligibleCount": 107,
  "almostReadyCount": 87,
  "notEligibleCount": 56,
  "averageGPA": 3.45,
  "passRate": 42.8,
  "bottlenecks": [...]
}
```

#### Get recent analytics
```bash
GET /api/analytics/recent
```

---

## 💾 Database Schema

### Student Collection
- `mssv` - Student ID (unique)
- `fullName` - Full name
- `email` - Email (unique)
- `faculty` - Faculty/Department
- `academicYear` - Academic year
- `studentType` - Regular/Dual/Talent
- `gpa` - GPA (0-4)
- `trainingPoints` - Training points (0-100)
- `hardCriteria` - Object with 5 boolean fields
- `softCriteria` - Object with 4 numeric fields (0-6)
- `evidenceSubmissions` - Array of evidence records
- `evaluationResult` - Status, score, confidence
- `createdAt`, `updatedAt` - Timestamps

### AnalyticsData Collection
- `academicYear` - Academic year
- `faculty` - Faculty
- Statistics (counts, averages, rates)
- `hardCriteriaPasses` - Pass rate for each criterion
- `softCriteriaAverages` - Average score for each criterion
- `bottlenecks` - Identified problem areas
- `clusterProfiles` - Student segments
- `correlationAnalysis` - Feature correlations
- `generatedAt` - When analysis was run
- `generatedBy` - Who ran the analysis

---

## 🔧 Using in Frontend

### Import API client
```typescript
import { studentAPI, analyticsAPI, downloadCSV } from '@/services/api';

// Get all students
const response = await studentAPI.getAll({ faculty: 'KHMT' });

// Create student
await studentAPI.create({
  mssv: '2024001',
  fullName: 'Student Name',
  ...
});

// Analyze data
const analysis = await analyticsAPI.analyze({ academicYear: 2024 });

// Download CSV
await downloadCSV({ academicYear: 2024 });
```

---

## 🐛 Troubleshooting

### MongoDB connection failed
- Check `MONGODB_URI` is correct
- Verify credentials
- Check IP whitelist (Atlas)
- Ensure MongoDB is running (local)

### CORS errors
- Server has CORS enabled
- Check `API_BASE_URL` in frontend

### Port already in use
```bash
# Change PORT in .env
PORT=5001
```

### Data not appearing
- Check MongoDB collection exists
- Verify data format matches schema
- Check validation rules

---

## 📊 Example: Create and Analyze Students

```bash
# Start server
npm run server:dev

# In another terminal
# Create a student
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "mssv": "2024001",
    "fullName": "Nguyễn Văn A",
    "email": "a@student.edu.vn",
    "faculty": "KHMT",
    "academicYear": 2024,
    "gpa": 3.8
  }'

# Get all students
curl http://localhost:5000/api/students/all

# Analyze dataset
curl http://localhost:5000/api/analytics/analyze

# Export CSV
curl http://localhost:5000/api/analytics/export-csv -o dataset.csv
```

---

## ✅ Verification Checklist

- [ ] MongoDB URI configured in `.env`
- [ ] `npm install` completed
- [ ] Server starts without errors
- [ ] `/health` endpoint returns status
- [ ] Can create student via API
- [ ] Can retrieve students via API
- [ ] Can analyze dataset
- [ ] Can export CSV
- [ ] Frontend connects to API
- [ ] No CORS errors in browser console

---

**🎉 MongoDB integration complete! Ready for Phase 2 (ML Model Training)**
