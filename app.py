from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS for handling cross-origin requests

# Load model and scaler
model = joblib.load('skilvul IOT/anomaly_detection_model.pkl')
scaler = joblib.load('skilvul IOT/scaler.pkl')

data_storage = {'temperature': None, 'humidity': None}

@app.route('/predict', methods=['POST'])
def predict():
    global data_storage
    try:
        data = request.get_json()

        # Logging data received
        print(f"Data received: {data}")

        data_storage['temperature'] = data['temperature']
        data_storage['humidity'] = data['humidity']

        # Create DataFrame with correct column names
        df = pd.DataFrame([data], columns=['temperature', 'humidity'])

        # Rename columns to match the model's expected input
        df.columns = ['Temperature', 'Humidity']

        # Scale the data
        new_data_scaled = scaler.transform(df)
        
        # Make predictions
        prediction = model.predict(new_data_scaled)

        # Determine if there is an anomaly
        is_anomaly = int((prediction == -1).astype(int)[0])

        # Print message based on anomaly detection result
        temperature = data['temperature']
        humidity = data['humidity']
        if is_anomaly == 0:
            print(f"\n(Suhu: {temperature} °C, Kelembaban: {humidity} %) \nSuhu dan kelembaban normal.\n")
        else:
            print(f"\n(Suhu: {temperature} °C, Kelembaban: {humidity} %) \nPeringatan: Ada anomali pada suhu atau kelembaban!\n")

        # Return predictions
        response = {'anomaly': is_anomaly}
        return jsonify(response)

    except Exception as e:
        print(f"Error: {e}")  # Print error to console
        return jsonify({'error': str(e)}), 500

@app.route('/data', methods=['GET'])
def get_data():
    global data_storage
    return jsonify(data_storage)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
