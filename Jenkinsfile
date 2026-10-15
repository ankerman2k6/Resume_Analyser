def version = "v0.${BUILD_NUMBER}"

pipeline {
    agent any

    tools {
        jdk 'jdk21'
        maven 'maven3'
        nodejs 'node20'
    }

    environment {
        DOCKERHUB_USERNAME = "antony1552006"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/resume-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/resume-backend"
        MONGO_IMAGE = "${DOCKERHUB_USERNAME}/resume-mongodb"
        VERSION = "${version}"
        GIT_REPO_URL = "https://github.com/ankerman2k6/Resume_Analyser.git"
        GIT_BRANCH = "frontend/candiate"
    }

    stages {
        stage("1. Check Code") {
            steps {
                echo "=== BƯỚC 1: KÉO CODE TỪ GITHUB ==="
                git branch: "${GIT_BRANCH}", url: "${GIT_REPO_URL}"
                script {
                    // Lấy mã hash commit rút gọn (vd: a1b2c3d)
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.VERSION_COMMIT = "${env.VERSION}-${env.GIT_COMMIT_SHORT}"
                    echo "Phiên bản build: ${env.VERSION_COMMIT}"
                }
            }
        }

        stage("2. Test Code") {
            parallel {
                stage("Test Frontend") {
                    steps {
                        echo "=== KIỂM THỬ FRONTEND ==="
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm test -- --passWithNoTests'
                        }
                    }
                }
                stage("Test Backend") {
                    steps {
                        echo "=== KIỂM THỬ BACKEND ==="
                        dir('backend') {
                            // Chạy compile và test bằng Maven để sinh class file cho SonarQube
                            sh 'chmod +x ./mvnw'
                            sh './mvnw test'
                        }
                    }
                }
            }
        }

        stage("3. SonarQube Analysis") {
            steps {
                echo "=== BƯỚC 3: QUÉT MÃ NGUỒN BẰNG SONARQUBE ==="
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('SonarQube') {
                        // Quét mã nguồn dựa trên cấu hình trong file sonar-project.properties
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectVersion=${env.VERSION_COMMIT}"
                    }
                }
            }
        }

        stage("4. Quality Gate") {
            steps {
                echo "=== BƯỚC 4: KIỂM TRA CHẤT LƯỢNG MÃ NGUỒN (QUALITY GATE) ==="
                timeout(time: 2, unit: 'MINUTES') {
                    // Chờ Webhook từ SonarQube gửi tín hiệu về: Nếu code đạt chuẩn mới cho đi tiếp
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage("5. Build & Push Docker Images") {
            steps {
                echo "=== BƯỚC 5: ĐÓNG GÓI VÀ ĐẨY IMAGES LÊN DOCKER HUB ==="
                script {
                    // Sử dụng đúng credential dockerhub-credentials của bạn
                    withDockerRegistry(credentialsId: 'dockerhub-credentials', toolName: 'docker') {
                        // 1. Build & Push Frontend Image
                        echo "Đang build & push Frontend Image..."
                        dir('frontend') {
                            sh """
                                docker build -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:${VERSION_COMMIT} .
                                docker push ${FRONTEND_IMAGE}:${VERSION}
                                docker push ${FRONTEND_IMAGE}:${VERSION_COMMIT}
                            """
                        }

                        // 2. Build & Push Backend Image
                        echo "Đang build & push Backend Image..."
                        dir('backend') {
                            sh """
                                docker build -t ${BACKEND_IMAGE}:${VERSION} -t ${BACKEND_IMAGE}:${VERSION_COMMIT} .
                                docker push ${BACKEND_IMAGE}:${VERSION}
                                docker push ${BACKEND_IMAGE}:${VERSION_COMMIT}
                            """
                        }

                        // 3. Build & Push MongoDB Image (kèm sẵn dữ liệu cv_screening)
                        echo "Đang build & push MongoDB Image..."
                        dir('mongo-init') {
                            sh """
                                docker build -t ${MONGO_IMAGE}:${VERSION} -t ${MONGO_IMAGE}:${VERSION_COMMIT} .
                                docker push ${MONGO_IMAGE}:${VERSION}
                                docker push ${MONGO_IMAGE}:${VERSION_COMMIT}
                            """
                        }
                    }
                }
            }
        }

        stage("6. Deploy Containers") {
            steps {
                echo "=== BƯỚC 6: TRIỂN KHAI CONTAINERS VỚI PHIÊN BẢN MỚI ==="
                sh """
                    # Ghi tag phiên bản mới nhất vào file .env cho docker-compose
                    echo "FRONTEND_IMAGE=${FRONTEND_IMAGE}" > .env
                    echo "BACKEND_IMAGE=${BACKEND_IMAGE}" >> .env
                    echo "MONGO_IMAGE=${MONGO_IMAGE}" >> .env
                    echo "VERSION=${VERSION_COMMIT}" >> .env

                    echo "Dừng và dọn dẹp container cũ (nếu có)..."
                    docker compose down --remove-orphans || true
                    docker rm -f resume-backend resume-frontend resume-mongodb 2>/dev/null || true

                    echo "Khởi chạy container mới bằng images vừa build..."
                    docker compose up -d --force-recreate
                """
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline hoàn tất thành công! Đã qua kiểm tra SonarQube Quality Gate và Deploy với tag ${env.VERSION_COMMIT}"
        }
        failure {
            echo "❌ Pipeline thất bại! Vui lòng kiểm tra lại log chi tiết."
        }
    }
}