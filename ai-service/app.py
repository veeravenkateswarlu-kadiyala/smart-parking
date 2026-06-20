from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simulated ML model for occupancy prediction
# In production, load a trained scikit-learn/TensorFlow model
HOURLY_PATTERNS = [
    15, 10, 8, 5, 8, 15, 35, 55, 70, 65, 55, 50,
    58, 62, 55, 50, 60, 75, 80, 70, 55, 40, 30, 20
]

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'ai-prediction'})

@app.route('/predict')
def predict():
    current_hour = datetime.now().hour
    base_occupancy = HOURLY_PATTERNS[current_hour]
    noise = np.random.normal(0, 5)
    expected = int(np.clip(base_occupancy + noise, 0, 100))

    peak_hours = []
    for i, val in enumerate(HOURLY_PATTERNS):
        if val >= 65:
            peak_hours.append(f"{i:02d}:00")

    low_periods = []
    for i in range(len(HOURLY_PATTERNS) - 1):
        if HOURLY_PATTERNS[i] < 25 and HOURLY_PATTERNS[i + 1] < 25:
            low_periods.append(f"{i:02d}:00 - {(i+2):02d}:00")

    hourly_forecast = []
    for i, base in enumerate(HOURLY_PATTERNS):
        hourly_forecast.append({
            'hour': f"{i:02d}:00",
            'occupancy': int(np.clip(base + np.random.normal(0, 3), 0, 100))
        })

    best_idx = np.argmin(HOURLY_PATTERNS[8:18]) + 8

    return jsonify({
        'expectedOccupancy': expected,
        'peakHours': peak_hours[:3],
        'bestTimeToPark': f"{best_idx:02d}:00 - {(best_idx+1):02d}:00",
        'lowTrafficPeriods': low_periods[:2] or ['06:00 - 08:00', '14:00 - 16:00'],
        'hourlyForecast': hourly_forecast,
        'recommendations': [
            'Park in Zone C for lowest occupancy during peak hours',
            'Arrive before 9 AM to avoid congestion',
            'EV slots available in Zone B with 40% lower occupancy',
        ],
        'model': 'occupancy_predictor_v1',
        'confidence': round(85 + np.random.random() * 10, 1),
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
