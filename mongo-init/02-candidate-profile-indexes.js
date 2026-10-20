// Indexes for Candidate Profile and CV screening collections
db = db.getSiblingDB('cv_screening');

// 1. candidate_profiles
db.candidate_profiles.createIndex({ userId: 1 }, { unique: true });

// 2. cvs
db.cvs.createIndex({ candidateId: 1, createdAt: -1, _id: -1 });

// 3. applications
db.applications.createIndex({ candidateId: 1, appliedAt: -1, _id: -1 });
db.applications.createIndex({ candidateId: 1, status: 1, appliedAt: -1, _id: -1 });
db.applications.createIndex({ cvId: 1 });

// 4. cv_analyses
db.cv_analyses.createIndex({ applicationId: 1, analyzedAt: -1, _id: -1 });
db.cv_analyses.createIndex({ cvId: 1 });

// 5. interviews
db.interviews.createIndex({ applicationId: 1, status: 1, scheduledAt: 1, _id: 1 });
