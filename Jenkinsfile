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
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    // ఇప్పుడు వెబ్‌హుక్ ఉంది కాబట్టి ఇది స్ట్రక్ అవ్వకుండా రిజల్ట్ తీసేసుకుంటుంది
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
