pipeline {
    agent any
    tools {
        nodejs 'node20'
        jdk 'jdk21'
    }
    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
    }
    parameters {
        string(name: 'DEPLOY_HOST', defaultValue: 'localhost', description: 'Hostname/IP accessible to users, without scheme or port.')
    }
    triggers { githubPush() }
    environment {
        DOCKERHUB_USERNAME = 'bacdepzaiz7'
        FRONTEND_IMAGE = 'bacdepzaiz7/resume-frontend'
        BACKEND_IMAGE = 'bacdepzaiz7/resume-backend'
        MONGO_IMAGE = 'bacdepzaiz7/resume-mongodb'
        GIT_REPO_URL = 'https://github.com/ankerman2k6/Resume_Analyser.git'
        GIT_BRANCH = 'backend/hr-dashboard'
        COMPOSE_PROJECT_NAME = 'resume_analyser'
        CI = 'true'
    }
    stages {
        stage('Checkout Source') {
            steps {
                script {
                    if (!isUnix()) { error('Use a Linux Jenkins agent with sh, Docker and Compose.') }
                }
                git branch: env.GIT_BRANCH, url: env.GIT_REPO_URL
                script {
                    env.COMMIT_HASH = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
                    env.VERSION = "v0.${env.BUILD_NUMBER}"
                    env.VERSION_COMMIT = "${env.VERSION}-${env.COMMIT_HASH}"
                    currentBuild.displayName = env.VERSION_COMMIT
                }
                sh '''
                    set -eu
                    mkdir -p ci-artifacts
                    rm -f ci-artifacts/*.xml ci-artifacts/*.txt ci-artifacts/*.log backend/target/surefire-reports/*.xml backend/target/surefire-reports/*.txt
                    node --version | grep -E '^v20[.]'
                    java -version 2>&1 | grep -E 'version "21[."]'
                    docker version
                    docker compose version
                    docker compose up --help | grep -- --wait-timeout
                    test -f frontend/package-lock.json
                    test -f backend/pom.xml
                    test -f mongo-init/Dockerfile
                    test -f docker-compose.yml
                    test -f frontend/Dockerfile
                    test -f backend/Dockerfile
                '''
            }
        }
        stage('Test Code') {
            parallel {
                stage('Frontend Unit Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci --no-audit --no-fund'
                            // Existing test script: vitest run, without watch mode.
                            sh 'npm test -- --passWithNoTests --reporter=default --reporter=junit --outputFile=../ci-artifacts/frontend-junit.xml'
                        }
                    }
                }
                stage('Backend Unit Tests') {
                    steps {
                        dir('backend') {
                            sh '''
                                set -eu
                                if [ -f mvnw ]; then
                                    chmod +x ./mvnw
                                    ./mvnw -B test
                                else
                                    mvn -B test
                                fi
                            '''
                        }
                    }
                }
            }
        }
        stage('Build & Push Docker Images') {
            steps {
                // Build all images before publishing any tag.
                sh '''
                    set -eu
                    docker build -t "$FRONTEND_IMAGE:$VERSION" -t "$FRONTEND_IMAGE:$VERSION_COMMIT" ./frontend
                    docker build -t "$BACKEND_IMAGE:$VERSION" -t "$BACKEND_IMAGE:$VERSION_COMMIT" ./backend
                    docker build -t "$MONGO_IMAGE:$VERSION" -t "$MONGO_IMAGE:$VERSION_COMMIT" ./mongo-init
                '''
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'HUB_USER', passwordVariable: 'HUB_TOKEN')]) {
                    sh '''
                        set +x
                        set -eu
                        test "$HUB_USER" = "$DOCKERHUB_USERNAME"
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT
                        printf '%s' "$HUB_TOKEN" | docker login --username "$HUB_USER" --password-stdin
                        for image in "$FRONTEND_IMAGE" "$BACKEND_IMAGE" "$MONGO_IMAGE"; do
                            docker push "$image:$VERSION"
                            docker push "$image:$VERSION_COMMIT"
                        done
                    '''
                }
            }
        }
        stage('Deploy Docker Compose') {
            steps {
                writeFile file: '.env', text: """FRONTEND_IMAGE=${env.FRONTEND_IMAGE}
BACKEND_IMAGE=${env.BACKEND_IMAGE}
MONGO_IMAGE=${env.MONGO_IMAGE}
VERSION=${env.VERSION_COMMIT}
VERSION_COMMIT=${env.VERSION_COMMIT}
COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT_NAME}
"""
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'HUB_USER', passwordVariable: 'HUB_TOKEN'),
                    string(credentialsId: 'resume-jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    sh '''
                        set +x
                        set -eu
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT
                        printf '%s' "$HUB_TOKEN" | docker login --username "$HUB_USER" --password-stdin
                        # Resolved config contains JWT_SECRET; validate without printing it.
                        # Shell variables override --env-file; deploy the commit tag explicitly.
                        export VERSION="$VERSION_COMMIT"
                        docker compose --env-file .env config --quiet
                        if ! docker network inspect resume-network >/dev/null 2>&1; then
                            docker network create resume-network
                        fi
                        docker compose --env-file .env pull
                        docker compose --env-file .env up -d --no-build --force-recreate --wait --wait-timeout 180
                        docker compose --env-file .env ps
                    '''
                }
            }
        }
    }
    post {
        always {
            junit testResults: 'ci-artifacts/frontend-junit.xml,backend/target/surefire-reports/*.xml', allowEmptyResults: true
            archiveArtifacts artifacts: 'ci-artifacts/*,backend/target/surefire-reports/*', allowEmptyArchive: true
        }
        success {
            echo "Deployed ${env.VERSION_COMMIT}"
            echo "Pushed: ${env.FRONTEND_IMAGE}, ${env.BACKEND_IMAGE}, ${env.MONGO_IMAGE}; tags: ${env.VERSION} and ${env.VERSION_COMMIT}"
            echo "Frontend: http://${params.DEPLOY_HOST}:3000 ; Backend: http://${params.DEPLOY_HOST}:8081 ; Health: http://${params.DEPLOY_HOST}:8081/actuator/health"
        }
        failure {
            echo 'Pipeline FAILED. See the failing stage and reports. MongoDB volumes are preserved.'
            script {
                if (isUnix() && fileExists('.env') && env.VERSION_COMMIT) {
                    sh returnStatus: true, script: '''
                        mkdir -p ci-artifacts
                        JWT_SECRET=diagnostic-placeholder docker compose --env-file .env ps -a > ci-artifacts/containers.txt 2>&1
                        JWT_SECRET=diagnostic-placeholder docker compose --env-file .env logs --no-color --tail=200 > ci-artifacts/deploy.log 2>&1
                    '''
                    archiveArtifacts artifacts: 'ci-artifacts/*', allowEmptyArchive: true
                }
            }
        }
    }
}
