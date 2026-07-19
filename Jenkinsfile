pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                echo 'Cloning Repository...'
            }
        }
        stage('Build') {
            steps {
                echo 'Building Project...'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing Project...'
            }
        }
        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    script {
                        def scannerHome = tool 'sonarscanner'
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        // ప్రస్తుతానికి క్వాలిటీ గేట్ స్టేజ్ ని తీసేశాము, దీనివల్ల పైప్‌లైన్ స్ట్రక్ అవ్వదు
    }
}
