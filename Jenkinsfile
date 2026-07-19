pipeline {
    agent any
    
    tools {
        // Step 13 లో మీరు ఇచ్చిన SonarScanner పేరు ఇక్కడ మ్యాచ్ అవ్వాలి
        sonarScanner 'SonarScanner' 
    }

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
        // --- ఇక్కడి నుండి కొత్త స్టేజీలు ---
        stage('SonarQube Scan') {
            steps {
                // Step 12 లో మీరు ఇచ్చిన SonarQube సర్వర్ పేరు 'SonarQube' అవ్వాలి
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
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
