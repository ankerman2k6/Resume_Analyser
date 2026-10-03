const seedDb = db.getSiblingDB("cv_screening");

print("==================================================");
print("CV SCREENING - SAFE SEED");
print("Database: " + seedDb.getName());
print("==================================================");

// --------------------------------------------------
// 0. Kiểm tra collection + validator
// --------------------------------------------------

const expectedCollections = [
    "users",
    "candidate_profiles",
    "recruiter_profiles",
    "companies",
    "jobs",
    "cvs",
    "applications",
    "cv_analyses",
    "interviews",
    "cv_templates"
];

const infos = seedDb.getCollectionInfos();
const infoByName = Object.fromEntries(infos.map(x => [x.name, x]));

for (const name of expectedCollections) {
    if (!infoByName[name]) {
        throw new Error(`Thiếu collection: ${name}`);
    }

    const validator = infoByName[name].options?.validator;
    if (!validator || Object.keys(validator).length === 0) {
        throw new Error(`Collection "${name}" chưa có validator. Hãy apply validation trước.`);
    }
}

print("Collection + validator check -> OK");

// --------------------------------------------------
// 1. Xóa CHỈ dữ liệu test cũ
//    Không drop collection => validator/index/options vẫn còn.
// --------------------------------------------------

const deleteOrder = [
    "cv_analyses",
    "interviews",
    "applications",
    "cvs",
    "jobs",
    "cv_templates",
    "candidate_profiles",
    "recruiter_profiles",
    "companies",
    "users"
];

for (const name of deleteOrder) {
    seedDb.getCollection(name).deleteMany({});
}

print("Old test documents cleared -> OK");

// --------------------------------------------------
// 2. Indexes
// --------------------------------------------------

seedDb.users.createIndex(
    { email: 1 },
    { unique: true, name: "ux_users_email" }
);

seedDb.candidate_profiles.createIndex(
    { userId: 1 },
    { unique: true, name: "ux_candidate_profiles_user" }
);

seedDb.recruiter_profiles.createIndex(
    { userId: 1 },
    { unique: true, name: "ux_recruiter_profiles_user" }
);

seedDb.recruiter_profiles.createIndex(
    { companyId: 1 },
    { name: "ix_recruiter_profiles_company" }
);

seedDb.jobs.createIndex(
    { companyId: 1 },
    { name: "ix_jobs_company" }
);

seedDb.jobs.createIndex(
    { recruiterId: 1 },
    { name: "ix_jobs_recruiter" }
);

seedDb.jobs.createIndex(
    { status: 1, deadline: 1 },
    { name: "ix_jobs_status_deadline" }
);

seedDb.jobs.createIndex(
    { category: 1, "location.city": 1 },
    { name: "ix_jobs_category_city" }
);

seedDb.cvs.createIndex(
    { candidateId: 1 },
    { name: "ix_cvs_candidate" }
);

seedDb.applications.createIndex(
    { candidateId: 1, jobId: 1 },
    { unique: true, name: "ux_applications_candidate_job" }
);

seedDb.applications.createIndex(
    { jobId: 1, status: 1 },
    { name: "ix_applications_job_status" }
);

seedDb.applications.createIndex(
    { cvId: 1 },
    { name: "ix_applications_cv" }
);

seedDb.cv_analyses.createIndex(
    { applicationId: 1, analyzedAt: -1 },
    { name: "ix_cv_analyses_application_date" }
);

seedDb.cv_analyses.createIndex(
    { jobId: 1, "scores.overall": -1 },
    { name: "ix_cv_analyses_job_score" }
);

seedDb.interviews.createIndex(
    { applicationId: 1, scheduledAt: 1 },
    { name: "ix_interviews_application_schedule" }
);

seedDb.cv_templates.createIndex(
    { status: 1 },
    { name: "ix_cv_templates_status" }
);

print("Indexes -> OK");

// --------------------------------------------------
// 3. Helpers
// --------------------------------------------------

const now = new Date("2026-10-04T01:30:00.000Z");
const dt = (iso) => new Date(iso);

// --------------------------------------------------
// 4. USERS
//    11 docs = 5 candidates + 5 recruiters + 1 admin
// --------------------------------------------------

const candidateUsers = [
    {
        email: "candidate01@example.com",
        passwordHash: "DEMO_HASH_CANDIDATE_01",
        role: "candidate",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "candidate02@example.com",
        passwordHash: "DEMO_HASH_CANDIDATE_02",
        role: "candidate",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "candidate03@example.com",
        passwordHash: "DEMO_HASH_CANDIDATE_03",
        role: "candidate",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "candidate04@example.com",
        passwordHash: "DEMO_HASH_CANDIDATE_04",
        role: "candidate",
        emailVerified: false,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "candidate05@example.com",
        passwordHash: "DEMO_HASH_CANDIDATE_05",
        role: "candidate",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    }
];

const recruiterUsers = [
    {
        email: "recruiter01@example.com",
        passwordHash: "DEMO_HASH_RECRUITER_01",
        role: "recruiter",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "recruiter02@example.com",
        passwordHash: "DEMO_HASH_RECRUITER_02",
        role: "recruiter",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "recruiter03@example.com",
        passwordHash: "DEMO_HASH_RECRUITER_03",
        role: "recruiter",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "recruiter04@example.com",
        passwordHash: "DEMO_HASH_RECRUITER_04",
        role: "recruiter",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        email: "recruiter05@example.com",
        passwordHash: "DEMO_HASH_RECRUITER_05",
        role: "recruiter",
        emailVerified: true,
        status: "active",
        createdAt: now,
        updatedAt: now
    }
];

const adminUser = {
    email: "admin@example.com",
    passwordHash: "DEMO_HASH_ADMIN",
    role: "admin",
    emailVerified: true,
    status: "active",
    createdAt: now,
    updatedAt: now
};

const candidateUserIds = seedDb.users.insertMany(candidateUsers).insertedIds;
const recruiterUserIds = seedDb.users.insertMany(recruiterUsers).insertedIds;
const adminUserId = seedDb.users.insertOne(adminUser).insertedId;

// --------------------------------------------------
// 5. COMPANIES - 5 docs
// --------------------------------------------------

const companyIds = seedDb.companies.insertMany([
    {
        name: "Aurora Technology",
        description: "Công ty phát triển sản phẩm phần mềm doanh nghiệp.",
        industry: "Information Technology",
        size: "100-500",
        website: "https://example.com/aurora",
        logoUrl: "/assets/company/aurora.png",
        locations: [
            { address: "Cầu Giấy", city: "Hà Nội", country: "Việt Nam" }
        ],
        createdAt: now,
        updatedAt: now
    },
    {
        name: "Blue Ocean Software",
        description: "Công ty phát triển web, mobile và cloud.",
        industry: "Software",
        size: "50-100",
        website: "https://example.com/blue-ocean",
        logoUrl: "/assets/company/blue-ocean.png",
        locations: [
            { address: "Lê Chân", city: "Hải Phòng", country: "Việt Nam" }
        ],
        createdAt: now,
        updatedAt: now
    },
    {
        name: "Green Data Labs",
        description: "Doanh nghiệp tập trung vào Data, AI và Machine Learning.",
        industry: "Artificial Intelligence",
        size: "20-50",
        website: "https://example.com/green-data",
        logoUrl: "/assets/company/green-data.png",
        locations: [
            { address: "Thanh Xuân", city: "Hà Nội", country: "Việt Nam" }
        ],
        createdAt: now,
        updatedAt: now
    },
    {
        name: "Nova Commerce",
        description: "Nền tảng thương mại điện tử và thanh toán.",
        industry: "E-Commerce",
        size: "500+",
        website: "https://example.com/nova-commerce",
        logoUrl: "/assets/company/nova-commerce.png",
        locations: [
            { address: "Quận 1", city: "TP. Hồ Chí Minh", country: "Việt Nam" }
        ],
        createdAt: now,
        updatedAt: now
    },
    {
        name: "Pixel Creative Studio",
        description: "Studio thiết kế sản phẩm số và trải nghiệm người dùng.",
        industry: "Design",
        size: "10-20",
        website: "https://example.com/pixel-studio",
        logoUrl: "/assets/company/pixel-studio.png",
        locations: [
            { address: "Ngô Quyền", city: "Hải Phòng", country: "Việt Nam" }
        ],
        createdAt: now,
        updatedAt: now
    }
]).insertedIds;

// --------------------------------------------------
// 6. CANDIDATE PROFILES - 5 docs
// --------------------------------------------------

const candidateProfileIds = seedDb.candidate_profiles.insertMany([
    {
        userId: candidateUserIds[0],
        fullName: "Nguyễn Minh Anh",
        phone: "0901000001",
        avatarUrl: "/assets/avatar/candidate01.png",
        location: { city: "Hà Nội", country: "Việt Nam" },
        createdAt: now,
        updatedAt: now
    },
    {
        userId: candidateUserIds[1],
        fullName: "Trần Gia Bảo",
        phone: "0901000002",
        avatarUrl: "/assets/avatar/candidate02.png",
        location: { city: "Hải Phòng", country: "Việt Nam" },
        createdAt: now,
        updatedAt: now
    },
    {
        userId: candidateUserIds[2],
        fullName: "Lê Khánh Linh",
        phone: "0901000003",
        avatarUrl: "/assets/avatar/candidate03.png",
        location: { city: "Hà Nội", country: "Việt Nam" },
        createdAt: now,
        updatedAt: now
    },
    {
        userId: candidateUserIds[3],
        fullName: "Phạm Quốc Huy",
        phone: "0901000004",
        avatarUrl: "/assets/avatar/candidate04.png",
        location: { city: "Đà Nẵng", country: "Việt Nam" },
        createdAt: now,
        updatedAt: now
    },
    {
        userId: candidateUserIds[4],
        fullName: "Vũ Thu Trang",
        phone: "0901000005",
        avatarUrl: "/assets/avatar/candidate05.png",
        location: { city: "TP. Hồ Chí Minh", country: "Việt Nam" },
        createdAt: now,
        updatedAt: now
    }
]).insertedIds;

// --------------------------------------------------
// 7. RECRUITER PROFILES - 5 docs
// --------------------------------------------------

const recruiterProfileIds = seedDb.recruiter_profiles.insertMany([
    {
        userId: recruiterUserIds[0],
        companyId: companyIds[0],
        fullName: "Đỗ Hoàng Nam",
        phone: "0912000001",
        position: "HR Manager",
        createdAt: now,
        updatedAt: now
    },
    {
        userId: recruiterUserIds[1],
        companyId: companyIds[1],
        fullName: "Nguyễn Thùy Dương",
        phone: "0912000002",
        position: "Technical Recruiter",
        createdAt: now,
        updatedAt: now
    },
    {
        userId: recruiterUserIds[2],
        companyId: companyIds[2],
        fullName: "Hoàng Đức Long",
        phone: "0912000003",
        position: "Talent Acquisition",
        createdAt: now,
        updatedAt: now
    },
    {
        userId: recruiterUserIds[3],
        companyId: companyIds[3],
        fullName: "Trịnh Mai Phương",
        phone: "0912000004",
        position: "Senior Recruiter",
        createdAt: now,
        updatedAt: now
    },
    {
        userId: recruiterUserIds[4],
        companyId: companyIds[4],
        fullName: "Bùi Anh Tuấn",
        phone: "0912000005",
        position: "Recruitment Specialist",
        createdAt: now,
        updatedAt: now
    }
]).insertedIds;

// --------------------------------------------------
// 8. CV TEMPLATES - 5 docs
// --------------------------------------------------

const templateIds = seedDb.cv_templates.insertMany([
    {
        createdBy: adminUserId,
        name: "Modern Backend",
        description: "Template tối ưu cho vị trí Backend Developer.",
        thumbnailUrl: "/templates/modern-backend.png",
        templateUrl: "/templates/modern-backend.html",
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        createdBy: adminUserId,
        name: "Clean Fresher",
        description: "Template gọn cho sinh viên và Fresher.",
        thumbnailUrl: "/templates/clean-fresher.png",
        templateUrl: "/templates/clean-fresher.html",
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        createdBy: adminUserId,
        name: "Research Academic",
        description: "Template dành cho hồ sơ nghiên cứu.",
        thumbnailUrl: "/templates/research-academic.png",
        templateUrl: "/templates/research-academic.html",
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        createdBy: adminUserId,
        name: "Professional Experience",
        description: "Template tập trung kinh nghiệm làm việc.",
        thumbnailUrl: "/templates/professional-experience.png",
        templateUrl: "/templates/professional-experience.html",
        status: "active",
        createdAt: now,
        updatedAt: now
    },
    {
        createdBy: adminUserId,
        name: "Creative Portfolio",
        description: "Template phù hợp thiết kế và portfolio.",
        thumbnailUrl: "/templates/creative-portfolio.png",
        templateUrl: "/templates/creative-portfolio.html",
        status: "draft",
        createdAt: now,
        updatedAt: now
    }
]).insertedIds;

// --------------------------------------------------
// 9. JOBS - 5 docs
// --------------------------------------------------

const jobIds = seedDb.jobs.insertMany([
    {
        companyId: companyIds[0],
        recruiterId: recruiterProfileIds[0],
        title: ".NET Backend Developer",
        description: "Phát triển REST API và dịch vụ backend bằng ASP.NET Core.",
        category: "Backend Development",
        employmentType: "full_time",
        location: {
            address: "Cầu Giấy",
            city: "Hà Nội",
            country: "Việt Nam",
            remote: false
        },
        salary: {
            min: 15000000,
            max: 25000000,
            currency: "VND",
            negotiable: true
        },
        experience: {
            minYears: 1,
            maxYears: 3,
            level: "junior"
        },
        requirements: {
            requiredSkills: ["C#", ".NET", "REST API"],
            preferredSkills: ["MongoDB", "Docker", "Redis"],
            education: {
                minimumDegree: "Bachelor",
                preferredMajors: ["Computer Science", "Software Engineering", "Information Technology"]
            },
            minimumGpa: {
                value: 3.0,
                scale: 4.0
            },
            languages: [
                { name: "English", minimumLevel: "B1" }
            ]
        },
        benefits: ["Health insurance", "13th month salary", "Training budget"],
        deadline: dt("2026-11-30T23:59:59.000Z"),
        status: "published",
        createdAt: now,
        updatedAt: now
    },
    {
        companyId: companyIds[1],
        recruiterId: recruiterProfileIds[1],
        title: "Java Spring Boot Developer",
        description: "Xây dựng backend service bằng Java và Spring Boot.",
        category: "Backend Development",
        employmentType: "full_time",
        location: {
            address: "Lê Chân",
            city: "Hải Phòng",
            country: "Việt Nam",
            remote: true
        },
        salary: {
            min: 18000000,
            max: 30000000,
            currency: "VND",
            negotiable: true
        },
        experience: {
            minYears: 2,
            maxYears: 4,
            level: "middle"
        },
        requirements: {
            requiredSkills: ["Java", "Spring Boot", "SQL"],
            preferredSkills: ["Docker", "Kafka", "MongoDB"],
            education: {
                minimumDegree: "Bachelor",
                preferredMajors: ["Computer Science", "Software Engineering"]
            },
            languages: [
                { name: "English", minimumLevel: "B1" }
            ]
        },
        benefits: ["Remote option", "Performance bonus"],
        deadline: dt("2026-12-15T23:59:59.000Z"),
        status: "published",
        createdAt: now,
        updatedAt: now
    },
    {
        companyId: companyIds[2],
        recruiterId: recruiterProfileIds[2],
        title: "Machine Learning Engineer",
        description: "Xây dựng pipeline Machine Learning và hệ thống recommendation.",
        category: "Artificial Intelligence",
        employmentType: "full_time",
        location: {
            address: "Thanh Xuân",
            city: "Hà Nội",
            country: "Việt Nam",
            remote: false
        },
        salary: {
            min: 20000000,
            max: 35000000,
            currency: "VND",
            negotiable: true
        },
        experience: {
            minYears: 1,
            maxYears: 3,
            level: "junior"
        },
        requirements: {
            requiredSkills: ["Python", "Machine Learning", "Pandas"],
            preferredSkills: ["PyTorch", "Transformers", "MongoDB"],
            education: {
                minimumDegree: "Bachelor",
                preferredMajors: ["Computer Science", "Data Science", "Artificial Intelligence"]
            },
            minimumGpa: {
                value: 3.2,
                scale: 4.0
            },
            languages: [
                { name: "English", minimumLevel: "B2" }
            ]
        },
        benefits: ["Research budget", "Conference support"],
        deadline: dt("2026-12-31T23:59:59.000Z"),
        status: "published",
        createdAt: now,
        updatedAt: now
    },
    {
        companyId: companyIds[3],
        recruiterId: recruiterProfileIds[3],
        title: "DevOps Engineer",
        description: "Quản lý CI/CD, containers và cloud infrastructure.",
        category: "DevOps",
        employmentType: "full_time",
        location: {
            address: "Quận 1",
            city: "TP. Hồ Chí Minh",
            country: "Việt Nam",
            remote: true
        },
        salary: {
            min: 22000000,
            max: 38000000,
            currency: "VND",
            negotiable: true
        },
        experience: {
            minYears: 2,
            maxYears: 5,
            level: "middle"
        },
        requirements: {
            requiredSkills: ["Docker", "Linux", "CI/CD"],
            preferredSkills: ["Kubernetes", "AWS", "Terraform"],
            languages: [
                { name: "English", minimumLevel: "B1" }
            ]
        },
        benefits: ["Hybrid work", "Cloud certification budget"],
        deadline: dt("2027-01-10T23:59:59.000Z"),
        status: "published",
        createdAt: now,
        updatedAt: now
    },
    {
        companyId: companyIds[4],
        recruiterId: recruiterProfileIds[4],
        title: "UI/UX Designer Intern",
        description: "Thiết kế giao diện, prototype và nghiên cứu trải nghiệm người dùng.",
        category: "Design",
        employmentType: "internship",
        location: {
            address: "Ngô Quyền",
            city: "Hải Phòng",
            country: "Việt Nam",
            remote: false
        },
        salary: {
            min: 4000000,
            max: 7000000,
            currency: "VND",
            negotiable: false
        },
        experience: {
            minYears: 0,
            maxYears: 1,
            level: "intern"
        },
        requirements: {
            requiredSkills: ["Figma", "UI Design"],
            preferredSkills: ["UX Research", "Adobe Illustrator"]
        },
        benefits: ["Mentoring", "Portfolio review"],
        deadline: dt("2026-11-20T23:59:59.000Z"),
        status: "published",
        createdAt: now,
        updatedAt: now
    }
]).insertedIds;

// --------------------------------------------------
// 10. CVS - 5 docs
//     Các cv làm khác nhau để minh họa khả năng linh động:
//     - CV 1: education + GPA + project
//     - CV 2: experience + certificates, không GPA/project
//     - CV 3: publication + customSections
//     - CV 4: DevOps, không education/GPA
//     - CV 5: portfolio + activity + award + reference
// --------------------------------------------------

const cvIds = seedDb.cvs.insertMany([
    {
        candidateId: candidateProfileIds[0],
        templateId: templateIds[1],
        title: "Fresher .NET Backend CV",
        source: {
            type: "template",
            fileName: "candidate01-backend.pdf",
            fileUrl: "/uploads/cvs/candidate01-backend.pdf",
            mimeType: "application/pdf"
        },
        personalInfo: {
            fullName: "Nguyễn Minh Anh",
            email: "candidate01@example.com",
            phone: "0901000001",
            address: {
                city: "Hà Nội",
                country: "Việt Nam"
            }
        },
        summary: "Sinh viên định hướng Backend Developer với C# và .NET.",
        education: [
            {
                institution: "ABC University",
                degree: "Bachelor",
                major: "Information Technology",
                gpa: { value: 3.55, scale: 4.0 },
                startDate: "2023-09",
                endDate: "2027-06",
                status: "studying",
                description: "Chuyên ngành Công nghệ thông tin."
            }
        ],
        skills: [
            { name: "C#", category: "Programming Language", level: "intermediate", yearsOfExperience: 2 },
            { name: ".NET", category: "Framework", level: "intermediate" },
            { name: "MongoDB", category: "Database" }
        ],
        projects: [
            {
                name: "CV Screening System",
                description: "Hệ thống tuyển dụng và sàng lọc CV.",
                role: "Backend Developer",
                startDate: "2026-09",
                technologies: ["C#", "ASP.NET Core", "MongoDB"],
                links: [
                    { type: "github", url: "https://github.com/example/cv-screening" }
                ],
                achievements: ["Thiết kế schema MongoDB", "Xây dựng REST API"]
            }
        ],
        languages: [
            { name: "English", level: "B1", certificate: "VSTEP", score: "B1" }
        ],
        links: [
            { type: "github", url: "https://github.com/example/minhanh" }
        ],
        parseInfo: {
            status: "completed",
            parserVersion: "1.0",
            parsedAt: now
        },
        createdAt: now,
        updatedAt: now
    },
    {
        candidateId: candidateProfileIds[1],
        templateId: templateIds[3],
        title: "Experienced Java Backend CV",
        source: {
            type: "uploaded",
            fileName: "candidate02-java.pdf",
            fileUrl: "/uploads/cvs/candidate02-java.pdf",
            mimeType: "application/pdf"
        },
        personalInfo: {
            fullName: "Trần Gia Bảo",
            email: "candidate02@example.com",
            phone: "0901000002",
            address: {
                city: "Hải Phòng",
                country: "Việt Nam"
            }
        },
        summary: "Backend Developer có kinh nghiệm với Java và Spring Boot.",
        experience: [
            {
                company: "Example Software",
                position: "Java Developer",
                employmentType: "full_time",
                startDate: "2023-07",
                endDate: "2026-08",
                current: false,
                location: "Hải Phòng",
                description: "Phát triển microservice và REST API.",
                technologies: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
                achievements: ["Tối ưu API", "Tham gia triển khai CI/CD"]
            }
        ],
        skills: [
            { name: "Java", category: "Programming Language", level: "advanced", yearsOfExperience: 3 },
            { name: "Spring Boot", category: "Framework", level: "advanced", yearsOfExperience: 3 },
            { name: "Docker", category: "DevOps", level: "intermediate" }
        ],
        certificates: [
            {
                name: "Oracle Java Foundations",
                issuer: "Oracle",
                issueDate: "2025-02",
                credentialId: "JAVA-DEMO-02",
                credentialUrl: "https://example.com/credentials/java-demo-02"
            }
        ],
        languages: [
            { name: "English", level: "B1" }
        ],
        parseInfo: {
            status: "completed",
            parserVersion: "1.0",
            parsedAt: now
        },
        createdAt: now,
        updatedAt: now
    },
    {
        candidateId: candidateProfileIds[2],
        templateId: templateIds[2],
        title: "Machine Learning Research CV",
        source: {
            type: "template",
            fileName: "candidate03-research.pdf",
            fileUrl: "/uploads/cvs/candidate03-research.pdf",
            mimeType: "application/pdf"
        },
        personalInfo: {
            fullName: "Lê Khánh Linh",
            email: "candidate03@example.com",
            phone: "0901000003",
            address: {
                city: "Hà Nội",
                country: "Việt Nam"
            }
        },
        summary: "Ứng viên quan tâm NLP, Machine Learning và hệ thống recommendation.",
        education: [
            {
                institution: "Data Science University",
                degree: "Bachelor",
                major: "Data Science",
                gpa: { value: 3.72, scale: 4.0 },
                startDate: "2022-09",
                endDate: "2026-06",
                status: "graduated"
            }
        ],
        skills: [
            { name: "Python", category: "Programming Language", level: "advanced" },
            { name: "Machine Learning", category: "AI", level: "intermediate" },
            { name: "PyTorch", category: "Framework", level: "intermediate" }
        ],
        publications: [
            {
                title: "A Small-Scale Study on CV Screening",
                publisher: "Student Research Journal",
                publishedDate: "2026",
                url: "https://example.com/publications/cv-screening",
                description: "Nghiên cứu thử nghiệm mô hình xếp hạng CV."
            }
        ],
        awards: [
            {
                title: "Student Research Award",
                issuer: "Data Science University",
                date: "2026",
                description: "Giải nghiên cứu sinh viên."
            }
        ],
        customSections: [
            {
                title: "Research Interests",
                items: [
                    {
                        field: "Natural Language Processing",
                        description: "CV parsing, classification and semantic matching"
                    }
                ]
            }
        ],
        links: [
            { type: "kaggle", url: "https://example.com/kaggle/linh" },
            { type: "github", url: "https://github.com/example/khanhlinh" }
        ],
        parseInfo: {
            status: "completed",
            parserVersion: "1.0",
            parsedAt: now
        },
        createdAt: now,
        updatedAt: now
    },
    {
        candidateId: candidateProfileIds[3],
        templateId: null,
        title: "DevOps Engineer CV",
        source: {
            type: "uploaded",
            fileName: "candidate04-devops.pdf",
            fileUrl: "/uploads/cvs/candidate04-devops.pdf",
            mimeType: "application/pdf"
        },
        personalInfo: {
            fullName: "Phạm Quốc Huy",
            email: "candidate04@example.com",
            phone: "0901000004",
            address: {
                city: "Đà Nẵng",
                country: "Việt Nam"
            }
        },
        experience: [
            {
                company: "Cloud Example",
                position: "Junior DevOps Engineer",
                employmentType: "full_time",
                startDate: "2024-01",
                current: true,
                location: "Đà Nẵng",
                description: "Vận hành container và CI/CD.",
                technologies: ["Docker", "Linux", "GitHub Actions", "AWS"],
                achievements: ["Chuẩn hóa Docker deployment"]
            }
        ],
        skills: [
            { name: "Docker", category: "DevOps", level: "advanced", yearsOfExperience: 2 },
            { name: "Linux", category: "Operating System", level: "advanced" },
            { name: "CI/CD", category: "DevOps", level: "intermediate" },
            { name: "AWS", category: "Cloud", level: "intermediate" }
        ],
        certificates: [
            {
                name: "AWS Cloud Practitioner",
                issuer: "Amazon Web Services",
                issueDate: "2025-11",
                expirationDate: "2028-11",
                credentialId: "AWS-DEMO-04"
            }
        ],
        parseInfo: {
            status: "completed",
            parserVersion: "1.0",
            parsedAt: now
        },
        createdAt: now,
        updatedAt: now
    },
    {
        candidateId: candidateProfileIds[4],
        templateId: templateIds[4],
        title: "UI UX Design Portfolio CV",
        source: {
            type: "template",
            fileName: "candidate05-uiux.pdf",
            fileUrl: "/uploads/cvs/candidate05-uiux.pdf",
            mimeType: "application/pdf"
        },
        personalInfo: {
            fullName: "Vũ Thu Trang",
            email: "candidate05@example.com",
            phone: "0901000005",
            address: {
                city: "TP. Hồ Chí Minh",
                country: "Việt Nam"
            }
        },
        summary: "Sinh viên thiết kế sản phẩm số, tập trung UI/UX và prototype.",
        education: [
            {
                institution: "Design College",
                degree: "Bachelor",
                major: "Digital Design",
                startDate: "2024-09",
                endDate: "2028-06",
                status: "studying"
            }
        ],
        skills: [
            { name: "Figma", category: "Design Tool", level: "advanced" },
            { name: "UI Design", category: "Design", level: "intermediate" },
            { name: "UX Research", category: "Design", level: "beginner" }
        ],
        projects: [
            {
                name: "Mobile Banking Redesign",
                description: "Redesign trải nghiệm mobile banking.",
                role: "UI/UX Designer",
                startDate: "2026-02",
                endDate: "2026-05",
                technologies: ["Figma"],
                links: [
                    { type: "portfolio", url: "https://example.com/portfolio/banking-redesign" }
                ],
                achievements: ["Hoàn thành prototype và usability test"]
            }
        ],
        activities: [
            {
                organization: "Design Club",
                role: "Member",
                startDate: "2025",
                endDate: "2026",
                description: "Tham gia workshop và design challenge."
            }
        ],
        awards: [
            {
                title: "Best Student UI Concept",
                issuer: "Design College",
                date: "2026",
                description: "Giải thiết kế giao diện sinh viên."
            }
        ],
        references: [
            {
                name: "Nguyễn Hoài An",
                position: "Lecturer",
                organization: "Design College",
                email: "lecturer@example.com",
                phone: "0909999999"
            }
        ],
        links: [
            { type: "portfolio", url: "https://example.com/portfolio/trang" }
        ],
        parseInfo: {
            status: "completed",
            parserVersion: "1.0",
            parsedAt: now
        },
        createdAt: now,
        updatedAt: now
    }
]).insertedIds;

// --------------------------------------------------
// 11. APPLICATIONS - 5 docs
// --------------------------------------------------

const applicationIds = seedDb.applications.insertMany([
    {
        candidateId: candidateProfileIds[0],
        jobId: jobIds[0],
        cvId: cvIds[0],
        status: "shortlisted",
        statusHistory: [
            { status: "applied", changedAt: dt("2026-10-04T02:00:00.000Z"), changedBy: candidateUserIds[0], note: "Ứng viên nộp hồ sơ." },
            { status: "screening", changedAt: dt("2026-10-04T03:00:00.000Z"), changedBy: recruiterUserIds[0] },
            { status: "shortlisted", changedAt: dt("2026-10-04T04:00:00.000Z"), changedBy: recruiterUserIds[0] }
        ],
        appliedAt: dt("2026-10-04T02:00:00.000Z"),
        updatedAt: dt("2026-10-04T04:00:00.000Z")
    },
    {
        candidateId: candidateProfileIds[1],
        jobId: jobIds[1],
        cvId: cvIds[1],
        status: "interview",
        statusHistory: [
            { status: "applied", changedAt: dt("2026-10-04T02:10:00.000Z"), changedBy: candidateUserIds[1] },
            { status: "screening", changedAt: dt("2026-10-04T03:10:00.000Z"), changedBy: recruiterUserIds[1] },
            { status: "interview", changedAt: dt("2026-10-04T05:10:00.000Z"), changedBy: recruiterUserIds[1] }
        ],
        appliedAt: dt("2026-10-04T02:10:00.000Z"),
        updatedAt: dt("2026-10-04T05:10:00.000Z")
    },
    {
        candidateId: candidateProfileIds[2],
        jobId: jobIds[2],
        cvId: cvIds[2],
        status: "interview",
        statusHistory: [
            { status: "applied", changedAt: dt("2026-10-04T02:20:00.000Z"), changedBy: candidateUserIds[2] },
            { status: "screening", changedAt: dt("2026-10-04T03:20:00.000Z"), changedBy: recruiterUserIds[2] },
            { status: "interview", changedAt: dt("2026-10-04T05:20:00.000Z"), changedBy: recruiterUserIds[2] }
        ],
        appliedAt: dt("2026-10-04T02:20:00.000Z"),
        updatedAt: dt("2026-10-04T05:20:00.000Z")
    },
    {
        candidateId: candidateProfileIds[3],
        jobId: jobIds[3],
        cvId: cvIds[3],
        status: "shortlisted",
        statusHistory: [
            { status: "applied", changedAt: dt("2026-10-04T02:30:00.000Z"), changedBy: candidateUserIds[3] },
            { status: "screening", changedAt: dt("2026-10-04T03:30:00.000Z"), changedBy: recruiterUserIds[3] },
            { status: "shortlisted", changedAt: dt("2026-10-04T05:30:00.000Z"), changedBy: recruiterUserIds[3] }
        ],
        appliedAt: dt("2026-10-04T02:30:00.000Z"),
        updatedAt: dt("2026-10-04T05:30:00.000Z")
    },
    {
        candidateId: candidateProfileIds[4],
        jobId: jobIds[4],
        cvId: cvIds[4],
        status: "interview",
        statusHistory: [
            { status: "applied", changedAt: dt("2026-10-04T02:40:00.000Z"), changedBy: candidateUserIds[4] },
            { status: "screening", changedAt: dt("2026-10-04T03:40:00.000Z"), changedBy: recruiterUserIds[4] },
            { status: "interview", changedAt: dt("2026-10-04T05:40:00.000Z"), changedBy: recruiterUserIds[4] }
        ],
        appliedAt: dt("2026-10-04T02:40:00.000Z"),
        updatedAt: dt("2026-10-04T05:40:00.000Z")
    }
]).insertedIds;

// --------------------------------------------------
// 12. CV ANALYSES - 5 docs
// --------------------------------------------------

seedDb.cv_analyses.insertMany([
    {
        cvId: cvIds[0],
        jobId: jobIds[0],
        applicationId: applicationIds[0],
        scores: {
            overall: 86,
            skills: 90,
            experience: 62,
            education: 88,
            projects: 92,
            certificates: 60
        },
        matchedSkills: ["C#", ".NET", "MongoDB"],
        missingSkills: ["Redis"],
        strengths: ["Kỹ năng .NET phù hợp", "Có project backend liên quan"],
        weaknesses: ["Kinh nghiệm thực tế còn ít"],
        recommendation: "Nên xem xét phỏng vấn.",
        modelVersion: "screening-v1",
        analyzedAt: dt("2026-10-04T03:30:00.000Z")
    },
    {
        cvId: cvIds[1],
        jobId: jobIds[1],
        applicationId: applicationIds[1],
        scores: {
            overall: 91,
            skills: 94,
            experience: 92,
            education: 70,
            projects: 65,
            certificates: 80
        },
        matchedSkills: ["Java", "Spring Boot", "Docker"],
        missingSkills: ["Kafka"],
        strengths: ["Kinh nghiệm Java phù hợp", "Có kinh nghiệm Docker"],
        weaknesses: ["Chưa thể hiện Kafka trong CV"],
        recommendation: "Phù hợp để phỏng vấn kỹ thuật.",
        modelVersion: "screening-v1",
        analyzedAt: dt("2026-10-04T03:40:00.000Z")
    },
    {
        cvId: cvIds[2],
        jobId: jobIds[2],
        applicationId: applicationIds[2],
        scores: {
            overall: 93,
            skills: 95,
            experience: 70,
            education: 95,
            projects: 82,
            certificates: 60
        },
        matchedSkills: ["Python", "Machine Learning", "PyTorch"],
        missingSkills: ["Transformers"],
        strengths: ["Nền tảng học thuật tốt", "Có publication liên quan"],
        weaknesses: ["Kinh nghiệm doanh nghiệp chưa nhiều"],
        recommendation: "Phù hợp với vòng phỏng vấn chuyên môn.",
        modelVersion: "screening-v1",
        analyzedAt: dt("2026-10-04T03:50:00.000Z")
    },
    {
        cvId: cvIds[3],
        jobId: jobIds[3],
        applicationId: applicationIds[3],
        scores: {
            overall: 88,
            skills: 92,
            experience: 85,
            education: 50,
            projects: 65,
            certificates: 85
        },
        matchedSkills: ["Docker", "Linux", "CI/CD", "AWS"],
        missingSkills: ["Kubernetes", "Terraform"],
        strengths: ["Có kinh nghiệm vận hành thực tế", "Kỹ năng Docker phù hợp"],
        weaknesses: ["Thiếu Kubernetes và Terraform"],
        recommendation: "Có thể shortlist và kiểm tra kiến thức cloud.",
        modelVersion: "screening-v1",
        analyzedAt: dt("2026-10-04T04:00:00.000Z")
    },
    {
        cvId: cvIds[4],
        jobId: jobIds[4],
        applicationId: applicationIds[4],
        scores: {
            overall: 89,
            skills: 91,
            experience: 60,
            education: 82,
            projects: 95,
            certificates: 50
        },
        matchedSkills: ["Figma", "UI Design", "UX Research"],
        missingSkills: ["Adobe Illustrator"],
        strengths: ["Portfolio phù hợp", "Có project UI/UX rõ ràng"],
        weaknesses: ["Kinh nghiệm thực tế còn ít"],
        recommendation: "Phù hợp phỏng vấn intern.",
        modelVersion: "screening-v1",
        analyzedAt: dt("2026-10-04T04:10:00.000Z")
    }
]);

// --------------------------------------------------
// 13. INTERVIEWS - 5 docs
// --------------------------------------------------

seedDb.interviews.insertMany([
    {
        applicationId: applicationIds[0],
        scheduledBy: recruiterProfileIds[0],
        scheduledAt: dt("2026-10-10T02:00:00.000Z"),
        durationMinutes: 60,
        mode: "online",
        meetingLink: "https://meet.example.com/backend-01",
        location: "",
        status: "scheduled",
        notes: "Phỏng vấn kỹ thuật .NET.",
        createdAt: now
    },
    {
        applicationId: applicationIds[1],
        scheduledBy: recruiterProfileIds[1],
        scheduledAt: dt("2026-10-11T03:00:00.000Z"),
        durationMinutes: 60,
        mode: "online",
        meetingLink: "https://meet.example.com/java-02",
        location: "",
        status: "scheduled",
        notes: "Phỏng vấn Java/Spring Boot.",
        createdAt: now
    },
    {
        applicationId: applicationIds[2],
        scheduledBy: recruiterProfileIds[2],
        scheduledAt: dt("2026-10-12T04:00:00.000Z"),
        durationMinutes: 75,
        mode: "offline",
        meetingLink: "",
        location: "Green Data Labs - Hà Nội",
        status: "scheduled",
        notes: "Trao đổi ML fundamentals và research.",
        createdAt: now
    },
    {
        applicationId: applicationIds[3],
        scheduledBy: recruiterProfileIds[3],
        scheduledAt: dt("2026-10-13T05:00:00.000Z"),
        durationMinutes: 60,
        mode: "hybrid",
        meetingLink: "https://meet.example.com/devops-04",
        location: "Nova Commerce - TP. Hồ Chí Minh",
        status: "scheduled",
        notes: "Trao đổi Linux, Docker và CI/CD.",
        createdAt: now
    },
    {
        applicationId: applicationIds[4],
        scheduledBy: recruiterProfileIds[4],
        scheduledAt: dt("2026-10-14T06:00:00.000Z"),
        durationMinutes: 45,
        mode: "online",
        meetingLink: "https://meet.example.com/design-05",
        location: "",
        status: "scheduled",
        notes: "Portfolio review và UI/UX discussion.",
        createdAt: now
    }
]);

// --------------------------------------------------
// 14. Verify counts
// --------------------------------------------------

print("");
print("==================================================");
print("SEED COMPLETE");
print("==================================================");

const counts = {
    users: seedDb.users.countDocuments(),
    candidate_profiles: seedDb.candidate_profiles.countDocuments(),
    recruiter_profiles: seedDb.recruiter_profiles.countDocuments(),
    companies: seedDb.companies.countDocuments(),
    jobs: seedDb.jobs.countDocuments(),
    cvs: seedDb.cvs.countDocuments(),
    applications: seedDb.applications.countDocuments(),
    cv_analyses: seedDb.cv_analyses.countDocuments(),
    interviews: seedDb.interviews.countDocuments(),
    cv_templates: seedDb.cv_templates.countDocuments()
};

printjson(counts);

if (
    counts.users !== 11 ||
    counts.candidate_profiles !== 5 ||
    counts.recruiter_profiles !== 5 ||
    counts.companies !== 5 ||
    counts.jobs !== 5 ||
    counts.cvs !== 5 ||
    counts.applications !== 5 ||
    counts.cv_analyses !== 5 ||
    counts.interviews !== 5 ||
    counts.cv_templates !== 5
) {
    throw new Error("Count verification failed.");
}

print("");
print("EXPECTED COUNTS -> OK");
print("All inserted documents passed the active validators.");
print("Next: mongodump the WHOLE database to preserve data + validators + indexes.");
