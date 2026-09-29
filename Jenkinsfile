pipeline {
    agent any

    stages {
        stage('Update README') {
            steps {
                // Lệnh thêm chữ "hello world" vào cuối file README.md
                sh 'echo "hello world" >> README.md'
                
                // (Tùy chọn) In nội dung file ra màn hình log để kiểm tra
                sh 'cat README.md'
            }
        }
    }
}
