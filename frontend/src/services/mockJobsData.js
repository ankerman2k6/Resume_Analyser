/**
 * Mock data cho Quản lý Bài tuyển dụng (Jobs) - Phân hệ HR KONEK ATS
 */

export const EXPERIENCE_LEVELS = [
  'Thực tập (Intern)',
  'Junior (1 - 2 năm)',
  'Middle (2 - 4 năm)',
  'Senior (4 - 6 năm)',
  'Lead / Quản lý (> 6 năm)',
];

export const JOB_STATUSES = ['Đang mở', 'Đã đóng'];

export const INITIAL_MOCK_JOBS = [
  {
    id: 'job-101',
    title: 'Senior Fullstack Engineer (React / Node.js)',
    department: 'Engineering & Architecture',
    location: 'Hà Nội (Hybrid)',
    experience: 'Senior (4 - 6 năm)',
    applicantsCount: 28,
    deadline: '2026-11-15',
    status: 'Đang mở',
    description:
      'Chịu trách nhiệm kiến trúc và phát triển các module cốt lõi của nền tảng KONEK ATS, bao gồm hệ thống trích xuất CV bằng AI và phân tích hồ sơ ứng viên thời gian thực.',
    requirements:
      'Tối thiểu 4+ năm kinh nghiệm với React, TypeScript và Node.js.\nThành thạo tối ưu hóa cơ sở dữ liệu MongoDB/PostgreSQL và RESTful/GraphQL API.\nHiểu sâu về kiến trúc Microservices, Clean Architecture và Docker containerization.',
    createdAt: '2026-10-01',
  },
  {
    id: 'job-102',
    title: 'AI / Machine Learning Engineer (NLP & LLMs)',
    department: 'AI Research & Intelligence',
    location: 'Hà Nội / Remote',
    experience: 'Senior (4 - 6 năm)',
    applicantsCount: 42,
    deadline: '2026-11-20',
    status: 'Đang mở',
    description:
      'Nghiên cứu và tinh chỉnh các mô hình ngôn ngữ lớn (LLMs), thuật toán matching ngữ nghĩa vector embedding để tự động đánh giá và chấm điểm CV so với JD tuyển dụng.',
    requirements:
      '3+ năm kinh nghiệm với Python, PyTorch/TensorFlow, HuggingFace transformers.\nCó kinh nghiệm triển khai Vector Databases (Qdrant, Pinecone, Milvus).\nKỹ năng Prompt Engineering và xây dựng Retrieval-Augmented Generation (RAG) pipeline.',
    createdAt: '2026-10-05',
  },
  {
    id: 'job-103',
    title: 'DevOps / SRE Platform Engineer',
    department: 'Cloud Infrastructure & Security',
    location: 'Hồ Chí Minh (On-site)',
    experience: 'Middle (2 - 4 năm)',
    applicantsCount: 15,
    deadline: '2026-10-31',
    status: 'Đang mở',
    description:
      'Xây dựng và vận hành hạ tầng Kubernetes trên AWS/GCP, thiết lập pipeline CI/CD tự động hóa, giám sát hiệu năng hệ thống (Prometheus/Grafana) và bảo mật dữ liệu.',
    requirements:
      '2+ năm kinh nghiệm vận hành cụm Kubernetes (EKS/GKE) và Docker.\nThành thạo công cụ Infrastructure as Code (Terraform) và CI/CD (GitHub Actions, GitLab CI).\nAm hiểu về mạng (VPC, Subnet, Load Balancer) và giám sát hệ thống.',
    createdAt: '2026-10-08',
  },
  {
    id: 'job-104',
    title: 'Product Designer / UI-UX Lead',
    department: 'Product & Design System',
    location: 'Đà Nẵng (Hybrid)',
    experience: 'Lead / Quản lý (> 6 năm)',
    applicantsCount: 19,
    deadline: '2026-10-15',
    status: 'Đã đóng',
    description:
      'Định hình ngôn ngữ thiết kế KONEK Design System, nghiên cứu trải nghiệm người dùng tuyển dụng (HR Journey) và tối ưu giao diện dashboard phân tích dữ liệu chuyên sâu.',
    requirements:
      '5+ năm kinh nghiệm thiết kế sản phẩm SaaS/B2B phức tạp.\nThành thạo Figma nâng cao (Auto Layout, Variables, Component Libraries, Tokens).\nKỹ năng nghiên cứu định tính/định lượng và phối hợp mượt mà với đội ngũ Engineering.',
    createdAt: '2026-09-20',
  },
];
