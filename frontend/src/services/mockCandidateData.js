/**
 * Dữ liệu Mock chuẩn cấu trúc MongoDB theo cv_screening.json
 * Dùng cho phân hệ Ứng viên (Candidate Profile & Dashboard)
 */

export const MOCK_CANDIDATE_PROFILE = {
  _id: '670a8d9b1c9a3d4f12340001',
  userId: '670a8d9b1c9a3d4f12340002',
  fullName: 'Nguyễn Thanh An',
  email: 'nguyenthanhan.dev@gmail.com',
  phone: '0912 345 678',
  avatarUrl: null, // Test fallback avatar pastel chữ cái đầu
  title: 'Senior Frontend & React Developer',
  bio: 'Lập trình viên Frontend với 4+ năm kinh nghiệm xây dựng hệ thống web hiện đại bằng ReactJS, Next.js, TypeScript và tích hợp RESTful/GraphQL APIs.',
  searchStatus: 'actively_looking', // 'actively_looking' | 'open' | 'not_looking'
  searchStatusLabel: 'Đang chủ động tìm việc',
  location: {
    address: 'Quận 1',
    city: 'Hồ Chí Minh',
    country: 'Việt Nam',
  },
  links: [
    { type: 'github', url: 'https://github.com/nguyenthanhan' },
    { type: 'linkedin', url: 'https://linkedin.com/in/nguyenthanhan' },
    { type: 'portfolio', url: 'https://thanhan.dev' }
  ],
  stats: {
    totalResumes: 2,
    totalApplications: 4,
    interviewScheduled: 1,
    avgMatchScore: 86
  },
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-10-14T10:30:00.000Z'
};

export const MOCK_CANDIDATE_CVS = [
  {
    _id: '670a8e121c9a3d4f12340010',
    candidateId: '670a8d9b1c9a3d4f12340001',
    title: 'Nguyen-Thanh-An-Senior-Frontend-Developer-Resume.pdf',
    isDefault: true,
    source: {
      fileName: 'Nguyen-Thanh-An-Senior-Frontend-Developer-Resume.pdf',
      fileUrl: '/uploads/resumes/Nguyen-Thanh-An-Senior-Frontend-Developer-Resume.pdf',
      fileSize: 1542031, // ~1.5 MB
      mimeType: 'application/pdf',
      type: 'uploaded'
    },
    parseInfo: {
      status: 'PARSED_SUCCESS',
      parserVersion: 'v2.4.0',
      parsedAt: '2026-10-11T19:05:00.000Z'
    },
    personalInfo: {
      fullName: 'Nguyễn Thanh An',
      email: 'nguyenthanhan.dev@gmail.com',
      phone: '0912 345 678',
      address: {
        city: 'TP. Hồ Chí Minh',
        country: 'Việt Nam'
      }
    },
    summary: 'Chuyên gia xây dựng giao diện người dùng tối ưu trải nghiệm và hiệu năng cao, thành thạo React, Next.js, Tailwind CSS, Vite và tích hợp micro-frontends.',
    skills: [
      { name: 'ReactJS', category: 'Frontend', level: 'Expert', yearsOfExperience: 4 },
      { name: 'TypeScript', category: 'Language', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'JavaScript (ES6+)', category: 'Language', level: 'Expert', yearsOfExperience: 4 },
      { name: 'Redux / Zustand', category: 'State Management', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'HTML5 & CSS3 / SCSS', category: 'Frontend', level: 'Expert', yearsOfExperience: 4 },
      { name: 'RESTful API / GraphQL', category: 'Backend Integration', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'Vite / Webpack', category: 'Build Tools', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'Git & CI/CD Basics', category: 'DevOps', level: 'Intermediate', yearsOfExperience: 2 }
    ],
    experience: [
      {
        company: 'VNG Corporation',
        position: 'Senior Frontend Engineer',
        employmentType: 'full_time',
        location: 'TP. Hồ Chí Minh',
        startDate: '2023-03',
        endDate: 'Hiện tại',
        current: true,
        description: 'Chịu trách nhiệm kiến trúc giao diện cho sản phẩm ZaloPay Merchant Portal phục vụ hàng triệu giao dịch mỗi tháng.',
        achievements: [
          'Tối ưu thời gian tải trang ban đầu (First Contentful Paint) từ 2.4s xuống 1.1s.',
          'Xây dựng thư viện Design System dùng chung cho 6 team nội bộ.'
        ],
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Jest']
      },
      {
        company: 'FPT Software',
        position: 'Frontend Developer',
        employmentType: 'full_time',
        location: 'TP. Hồ Chí Minh',
        startDate: '2021-06',
        endDate: '2023-02',
        current: false,
        description: 'Phát triển các tính năng web dashboard cho khách hàng tài chính và thương mại điện tử quốc tế.',
        achievements: [
          'Hoàn thành đúng hạn 100% sprint deliverables với độ phủ kiểm thử unit test > 80%.'
        ],
        technologies: ['ReactJS', 'JavaScript', 'CSS Modules', 'REST APIs']
      }
    ],
    education: [
      {
        institution: 'Đại học Bách Khoa TP.HCM',
        degree: 'Kỹ sư',
        major: 'Khoa học Máy tính',
        startDate: '2017-09',
        endDate: '2021-06',
        status: 'Đã tốt nghiệp',
        gpa: {
          value: 3.42,
          scale: 4
        },
        description: 'Chuyên ngành Kỹ thuật phần mềm & Mạng máy tính.'
      }
    ],
    certificates: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Coursera & Meta',
        issueDate: '2022-08',
        credentialId: 'META-FE-98312',
        credentialUrl: 'https://coursera.org/verify/professional-cert/META-FE'
      }
    ],
    languages: [
      { name: 'Tiếng Việt', level: 'Bản ngữ' },
      { name: 'Tiếng Anh', level: 'Thành thạo (IELTS 7.0)', score: '7.0' }
    ],
    createdAt: '2026-10-11T19:05:00.000Z',
    updatedAt: '2026-10-11T19:05:00.000Z'
  },
  {
    _id: '670a8e121c9a3d4f12340011',
    candidateId: '670a8d9b1c9a3d4f12340001',
    title: 'CV_Fullstack_JavaScript_React_NodeJS.pdf',
    isDefault: false,
    source: {
      fileName: 'CV_Fullstack_JavaScript_React_NodeJS.pdf',
      fileUrl: '/uploads/resumes/CV_Fullstack_JavaScript_React_NodeJS.pdf',
      fileSize: 2411724, // ~2.4 MB
      mimeType: 'application/pdf',
      type: 'uploaded'
    },
    parseInfo: {
      status: 'PARSED_SUCCESS',
      parserVersion: 'v2.4.0',
      parsedAt: '2026-10-10T14:20:00.000Z'
    },
    personalInfo: {
      fullName: 'Nguyễn Thanh An',
      email: 'nguyenthanhan.dev@gmail.com',
      phone: '0912 345 678',
      address: {
        city: 'TP. Hồ Chí Minh',
        country: 'Việt Nam'
      }
    },
    summary: 'Hồ sơ năng lực Fullstack tập trung vào ReactJS, NodeJS, Express và MongoDB.',
    skills: [
      { name: 'React', category: 'Frontend', level: 'Expert', yearsOfExperience: 4 },
      { name: 'NodeJS', category: 'Backend', level: 'Intermediate', yearsOfExperience: 2 },
      { name: 'MongoDB', category: 'Database', level: 'Intermediate', yearsOfExperience: 2 }
    ],
    experience: [],
    education: [],
    certificates: [],
    languages: [],
    createdAt: '2026-10-10T14:20:00.000Z',
    updatedAt: '2026-10-10T14:20:00.000Z'
  }
];

export const MOCK_CANDIDATE_APPLICATIONS = [
  {
    _id: '670b1a201c9a3d4f12340050',
    candidateId: '670a8d9b1c9a3d4f12340001',
    cvId: '670a8e121c9a3d4f12340010',
    jobId: '6ac15217f84ca0e8c243b00e',
    status: 'interview_scheduled', // 'applied' | 'reviewing' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected'
    appliedAt: '2026-10-06T08:30:00.000Z',
    updatedAt: '2026-10-12T15:00:00.000Z',
    job: {
      _id: '6ac15217f84ca0e8c243b00e',
      title: 'Senior Frontend Developer (ReactJS / TypeScript)',
      category: 'Frontend Development',
      employmentType: 'full_time',
      salary: {
        min: 25000000,
        max: 42000000,
        currency: 'VND',
        negotiable: true
      },
      location: {
        city: 'TP. Hồ Chí Minh',
        address: 'Tầng 12, Tòa nhà Bitexco, Quận 1',
        country: 'Việt Nam',
        remote: false
      }
    },
    company: {
      _id: '6ac15217f84ca0e8c243affa',
      name: 'FPT Software & Solutions',
      logoUrl: null,
      logoCode: 'FP',
      industry: 'Công nghệ thông tin & Phần mềm',
      size: '10,000+ nhân viên',
      website: 'https://fptsoftware.com'
    },
    aiAnalysis: {
      overallScore: 92,
      scores: {
        skills: 95,
        experience: 90,
        education: 88,
        projects: 92,
        certificates: 85
      },
      recommendation: 'Hồ sơ có độ tương thích rất cao với vị trí tuyển dụng. Đề xuất phỏng vấn vòng kỹ thuật ngay.',
      matchedSkills: ['ReactJS', 'TypeScript', 'Redux', 'HTML5/CSS3', 'RESTful API', 'Git'],
      missingSkills: ['Next.js 14 App Router (Có thể đào tạo nhanh)'],
      strengths: [
        'Kinh nghiệm 4+ năm làm việc với React và TypeScript thực tế',
        'Có chứng chỉ quốc tế và bằng cấp chuẩn ngành Khoa học máy tính'
      ],
      weaknesses: [
        'Cần cọ xát thêm về Docker triển khai micro-frontend'
      ]
    },
    interview: {
      _id: '670c2a501c9a3d4f12340099',
      scheduledAt: '2026-10-18T09:30:00.000Z',
      durationMinutes: 60,
      mode: 'online', // 'online' | 'offline'
      meetingLink: 'https://meet.google.com/abc-cmcv-xyz',
      location: 'Google Meet',
      status: 'scheduled',
      notes: 'Phỏng vấn kỹ thuật vòng 1 với Tech Lead và HR Manager. Vui lòng chuẩn bị máy tính có webcam và mic rõ ràng.'
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-06T08:30:00.000Z',
        note: 'Ứng viên nộp hồ sơ trực tuyến'
      },
      {
        status: 'reviewing',
        changedAt: '2026-10-08T10:00:00.000Z',
        note: 'Hồ sơ đang được phòng tuyển dụng thẩm định'
      },
      {
        status: 'shortlisted',
        changedAt: '2026-10-10T14:15:00.000Z',
        note: 'Vượt qua vòng lọc CV tự động của hệ thống AI với 92 điểm'
      },
      {
        status: 'interview_scheduled',
        changedAt: '2026-10-12T15:00:00.000Z',
        note: 'Đã xếp lịch phỏng vấn online vào 09:30 ngày 18/10/2026'
      }
    ]
  },
  {
    _id: '670b1a201c9a3d4f12340051',
    candidateId: '670a8d9b1c9a3d4f12340001',
    cvId: '670a8e121c9a3d4f12340010',
    jobId: '6ac15217f84ca0e8c243b00f',
    status: 'reviewing',
    appliedAt: '2026-10-09T11:20:00.000Z',
    updatedAt: '2026-10-11T09:00:00.000Z',
    job: {
      _id: '6ac15217f84ca0e8c243b00f',
      title: 'Fullstack Engineer (React & Node.js)',
      category: 'Fullstack Development',
      employmentType: 'full_time',
      salary: {
        min: 28000000,
        max: 45000000,
        currency: 'VND',
        negotiable: true
      },
      location: {
        city: 'TP. Hồ Chí Minh',
        address: 'Zalo D7, Khu Công Nghệ Cao, TP. Thủ Đức',
        country: 'Việt Nam',
        remote: true
      }
    },
    company: {
      _id: '6ac15217f84ca0e8c243affb',
      name: 'VNG Corporation',
      logoUrl: null,
      logoCode: 'VN',
      industry: 'Game & Internet Platforms',
      size: '3,000+ nhân viên',
      website: 'https://vng.com.vn'
    },
    aiAnalysis: {
      overallScore: 84,
      scores: {
        skills: 85,
        experience: 82,
        education: 85,
        projects: 88,
        certificates: 80
      },
      recommendation: 'Hồ sơ phù hợp tốt về phần Frontend, phần Backend NodeJS cần đánh giá thêm qua bài test logic.',
      matchedSkills: ['ReactJS', 'JavaScript', 'MongoDB', 'REST API'],
      missingSkills: ['Node.js microservices', 'Redis caching'],
      strengths: ['Nắm chắc React và tư duy phát triển UI bài bản'],
      weaknesses: ['Kinh nghiệm NodeJS thực chiến ít hơn 2 năm']
    },
    interview: null,
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-09T11:20:00.000Z',
        note: 'Ứng viên nộp hồ sơ'
      },
      {
        status: 'reviewing',
        changedAt: '2026-10-11T09:00:00.000Z',
        note: 'HR đang thẩm định hồ sơ cùng Trưởng bộ phận kỹ thuật'
      }
    ]
  },
  {
    _id: '670b1a201c9a3d4f12340052',
    candidateId: '670a8d9b1c9a3d4f12340001',
    cvId: '670a8e121c9a3d4f12340010',
    jobId: '6ac15217f84ca0e8c243b010',
    status: 'applied',
    appliedAt: '2026-10-13T16:45:00.000Z',
    updatedAt: '2026-10-13T16:45:00.000Z',
    job: {
      _id: '6ac15217f84ca0e8c243b010',
      title: 'UI/UX & Frontend Specialist',
      category: 'Design & Frontend',
      employmentType: 'full_time',
      salary: {
        min: 22000000,
        max: 35000000,
        currency: 'VND',
        negotiable: true
      },
      location: {
        city: 'Đà Nẵng',
        address: 'Bạch Đằng, Hải Châu',
        country: 'Việt Nam',
        remote: true
      }
    },
    company: {
      _id: '6ac15217f84ca0e8c243affc',
      name: 'Techcombank Digital Lab',
      logoUrl: null,
      logoCode: 'TC',
      industry: 'Ngân hàng & Tài chính số',
      size: '12,000+ nhân viên',
      website: 'https://techcombank.com'
    },
    aiAnalysis: {
      overallScore: 88,
      scores: {
        skills: 90,
        experience: 86,
        education: 85,
        projects: 90,
        certificates: 82
      },
      recommendation: 'Hồ sơ có thế mạnh rõ nét về thẩm mỹ giao diện và am hiểu quy trình sản phẩm.',
      matchedSkills: ['React', 'CSS3', 'Design System', 'Accessibility'],
      missingSkills: ['Figma advanced prototyping'],
      strengths: ['Có nền tảng thiết kế lẫn code frontend rất đồng đều'],
      weaknesses: []
    },
    interview: null,
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-13T16:45:00.000Z',
        note: 'Đã gửi hồ sơ thành công vào hệ thống'
      }
    ]
  },
  {
    _id: '670b1a201c9a3d4f12340053',
    candidateId: '670a8d9b1c9a3d4f12340001',
    cvId: '670a8e121c9a3d4f12340011',
    jobId: '6ac15217f84ca0e8c243b011',
    status: 'rejected',
    appliedAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-25T14:00:00.000Z',
    job: {
      _id: '6ac15217f84ca0e8c243b011',
      title: 'DevOps & Cloud Engineer (AWS / Kubernetes)',
      category: 'Cloud & Infrastructure',
      employmentType: 'full_time',
      salary: {
        min: 30000000,
        max: 55000000,
        currency: 'VND',
        negotiable: false
      },
      location: {
        city: 'Hà Nội',
        address: 'Keangnam Landmark 72, Nam Từ Liêm',
        country: 'Việt Nam',
        remote: false
      }
    },
    company: {
      _id: '6ac15217f84ca0e8c243affd',
      name: 'Shopee Vietnam Technology',
      logoUrl: null,
      logoCode: 'SP',
      industry: 'Thương mại điện tử',
      size: '5,000+ nhân viên',
      website: 'https://shopee.vn'
    },
    aiAnalysis: {
      overallScore: 54,
      scores: {
        skills: 45,
        experience: 50,
        education: 80,
        projects: 40,
        certificates: 40
      },
      recommendation: 'Hồ sơ chủ yếu là Frontend/Fullstack, thiếu các kỹ năng trọng yếu về Kubernetes, Terraform và AWS Infrastructure.',
      matchedSkills: ['Git', 'Linux Basics'],
      missingSkills: ['Kubernetes', 'Terraform', 'AWS Architecture', 'Ansible'],
      strengths: ['Nền tảng IT tốt'],
      weaknesses: ['Chưa có kinh nghiệm thực chiến hạ tầng đám mây quy mô lớn']
    },
    interview: null,
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-09-20T10:00:00.000Z',
        note: 'Nộp đơn ứng tuyển'
      },
      {
        status: 'rejected',
        changedAt: '2026-09-25T14:00:00.000Z',
        note: 'Hồ sơ chưa phù hợp với tiêu chuẩn kinh nghiệm vị trí DevOps cấp cao. Cảm ơn ứng viên đã quan tâm.'
      }
    ]
  }
];
