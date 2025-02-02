from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the model when the server starts
model = joblib.load("scrap_price_model.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Create DataFrame with the expected features
        input_data = {
            "Item Type": data['itemType'],
            "Brand": data['brand'],
            "Age (Years)": float(data['age']),
            "Condition": data['condition'],
            "Weight (kg)": float(data['weight']),
            "Material Composition": data['materialComposition'],
            "Battery Included": data['batteryIncluded'],
            "Visible Damage": data['visibleDamage'],
            "Screen Condition": data['screenCondition'],
            "Rust Presence": data['rustPresence'],
            "Wiring Condition": data['wiringCondition'],
            "Resale Potential": data['resalePotential']
        }
        
        # Convert to DataFrame
        df = pd.DataFrame([input_data])
        
        # Make prediction
        prediction = model.predict(df)
        
        return jsonify({
            'scrapPrice': float(prediction[0][0]),
            'repairCost': float(prediction[0][1]),
            'finalAmount': float(prediction[0][2])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001)