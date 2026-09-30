pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                echo '=== Bước 1: Cài đặt thư viện dependencies cho Frontend ==='
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                echo '=== Bước 2: Chạy kiểm thử tự động (Kiểm tra nút Đăng ký, Đăng nhập) ==='
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '=== Bước 3: Biên dịch dự án React sang thư mục dist ==='
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline CI/CD thành công: Mã nguồn đã vượt qua kiểm thử và build thành công!'
        }
        failure {
            echo '❌ Pipeline thất bại: Vui lòng kiểm tra lại log chi tiết ở bước lỗi.'
        }
    }
}
