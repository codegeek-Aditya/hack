import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from flask import Flask, request, jsonify

# Month order for consistency
MONTH_ORDER = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December']

class PatientPredictor:
    def __init__(self, csv_path='patient predicts evolve updated.csv'):
        self.csv_path = csv_path
        self.model = None
        self.scaler = None
        self.df = None

    def preprocess_data(self):
        """Preprocess the dataset for model training"""
        # Load the dataset
        self.df = pd.read_csv(self.csv_path)
        
        # Convert month to numeric
        self.df['Month_Numeric'] = self.df['Month'].map({month: index for index, month in enumerate(MONTH_ORDER, 1)})
        
        # One-hot encode departments
        self.df_encoded = pd.get_dummies(self.df, columns=['Department'], prefix='Dept')
        
        # Separate features and target
        self.X = self.df_encoded.drop(['Month', 'Number'], axis=1)
        self.y = self.df_encoded['Number']
        
    def train_model(self):
        """Train the Random Forest Regressor"""
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(self.X, self.y, test_size=0.2, random_state=42)
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
    def add_new_data(self, previous_month, previous_patients, current_month, department):
        """Add new data point to the existing dataset"""
        # Prepare new data point
        new_data = {
            'Month': current_month,
            'Department': department,
            'Number': previous_patients
        }
        
        # Append new data to the dataframe
        new_df = pd.DataFrame([new_data])
        self.df = pd.concat([self.df, new_df], ignore_index=True)
        
        # Retrain with updated dataset
        self.save_dataset()
        self.preprocess_data()
        self.train_model()
        
    def predict(self, current_month, department):
        """Predict patients for given month and department"""
        # Prepare input data
        current_input = pd.DataFrame({
            'Month_Numeric': [MONTH_ORDER.index(current_month) + 1],
            f'Dept_{department}': [1]
        })
        
        # Add zero columns for missing departments
        for col in self.X.columns:
            if col not in current_input.columns:
                current_input[col] = 0
        
        # Reorder columns to match training data
        current_input = current_input[self.X.columns]
        
        # Scale and predict
        current_input_scaled = self.scaler.transform(current_input)
        predicted_patients = self.model.predict(current_input_scaled)
        
        return int(predicted_patients[0])
    
    def save_dataset(self, filename='patient_predicts_evolve.csv'):
        """Save updated dataset"""
        self.df.to_csv(filename, index=False)

# Global predictor initialization
patient_predictor = PatientPredictor()
patient_predictor.preprocess_data()
patient_predictor.train_model()

app = Flask(__name__)

@app.route('/patient_prediction', methods=['POST'])
def predict_patient():
    """Endpoint for patient predictions"""
    try:
        # Get input data
        data = request.get_json()
        previous_month = data['previous_month']
        previous_patients = int(data['previous_patients'])
        current_month = data['current_month']
        department = data['department']
        
        # Add new data and retrain model
        patient_predictor.add_new_data(previous_month, previous_patients, current_month, department)
        
        # Predict patients
        predicted_patients = patient_predictor.predict(current_month, department)
        
        return jsonify({
            'predicted_patients': predicted_patients,
            'previous_month': previous_month,
            'current_month': current_month,
            'department': department,
            'message': 'Model retrained with new data'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)