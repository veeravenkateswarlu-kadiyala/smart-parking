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
                // ఇక్కడ మీ స్క్రీన్ షాట్ లో ఉన్న పేరు 'sonarscanner' కరెక్ట్ గా మ్యాచ్ చేసాను
                withSonarQubeEnv('SonarQube') {
                    def scannerHome = tool 'sonarscanner'
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
