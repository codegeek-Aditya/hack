import pickle
import numpy as np
import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load pickle models correctly
with open('xgboost_model.pkl', 'rb') as f:
    stage_one = pickle.load(f)

with open('medical_priority_predictor.pkl', 'rb') as f:
    stage_two = pickle.load(f)

@app.route('/')
def home():
    return "MediLink ML Backend Hit!"

@app.route('/opd_priority', methods=['POST'])
def predict_opd():
    try:
        data = request.get_json()
        
        # Extract features
        features = np.array([
            data['illness_severity'], 
            data['age'], 
            data['transmittable'], 
            data['disabled']
        ], dtype=np.float32).reshape(1, -1)

        # Get the patient rating
        patient_rating = int(data['patient_rating'])  # Assume rating is an integer between 1 to 5
        
        # Predict the priority
        prediction = stage_one.predict(features)
        rounded_priority = int(np.round(prediction[0]))

        # Adjust priority slightly based on patient_rating
        adjustment = 0.2 * (5 - patient_rating)  # Scale down the effect of the rating
        adjusted_priority = max(0, rounded_priority - adjustment)  # Ensure priority doesn't go below 0

        # Round final priority to integer
        final_priority = int(round(adjusted_priority))

        return jsonify({'priority': final_priority})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/bed_priority', methods=['POST'])
def predict_bed():
    try:
        data = request.get_json()

        # Define the features to use
        feature_names = ['illness_severity', 'doctor_offset', 'age', 'waiting_period', 'transmittable', 'disabled']
        features = np.array([[data[name] for name in feature_names]], dtype=np.float32)

        # Predict the bed priority
        prediction = stage_two.predict(features)
        rounded_priority = int(round(prediction[0]))

        # Get the patient rating
        patient_rating = int(data['patient_rating'])  # Assume rating is an integer between 1 to 5

        # Adjust the priority slightly based on patient_rating
        adjustment = 0.2 * (5 - patient_rating)  # Scale down the effect of the rating
        adjusted_priority = max(0, rounded_priority - adjustment)  # Ensure priority doesn't go below 0

        # Round final priority to integer
        final_priority = int(round(adjusted_priority))

        return jsonify({'priority': final_priority})
    except Exception as e:
        return jsonify({'error': str(e)})

# Month order for consistency
MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

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

@app.route('/patient_prediction', methods=['POST'])
def predict_patient():
    """Endpoint for patient predictions"""
    try:
        # Get input data
        data = request.get_json()
        current_month = data.get('current_month')
        department = data.get('department')
        previous_month = data.get('previous_month')
        previous_patients = data.get('previous_patients')
        
        # Check if previous_month and previous_patients are provided
        if previous_month and previous_patients:
            # Convert to int if provided
            previous_patients = int(previous_patients)
            
            # Add new data and retrain the model
            patient_predictor.add_new_data(previous_month, previous_patients, current_month, department)
            message = 'Model retrained with new data'
        else:
            # Use the original dataset without retraining
            message = 'Prediction based on original dataset'
        
        # Predict patients
        predicted_patients = patient_predictor.predict(current_month, department)
        
        return jsonify({
            'predicted_patients': predicted_patients,
            'current_month': current_month,
            'department': department,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


class RequirementPredictor:
    def __init__(self, csv_path='New_dataset_drugs.csv'):
        self.csv_path = csv_path
        self.model = None
        self.scaler = None
        self.imputer = None
        self.label_encoder = None
        self.df = None

        # Ensure CSV exists
        if not os.path.exists(csv_path):
            self.create_initial_dataset()

    def create_initial_dataset(self):
        """Create an initial dataset if none exists"""
        initial_data = {
            'Month_name': ['January'] * 3,
            'Item_name': ['Drug A', 'Drug B', 'Drug C'],
            'Amount': [1000, 1500, 2000]
        }
        df = pd.DataFrame(initial_data)
        df.to_csv(self.csv_path, index=False)
        print(f"Created initial dataset at {self.csv_path}")

    def preprocess_data(self):
        """Comprehensive data preprocessing"""
        # Load the dataset
        self.df = pd.read_csv(self.csv_path)
        
        # Ensure clean numeric data
        self.df['Amount'] = pd.to_numeric(
            self.df['Amount'].astype(str).str.replace(',', ''), 
            errors='coerce'
        ).fillna(0)
        
        # Drop rows with 0 or NaN amounts
        self.df = self.df[self.df['Amount'] > 0]
        
        # Convert month to numeric
        self.df['Month_Numeric'] = self.df['Month_name'].map({
            month: index for index, month in enumerate(MONTH_ORDER, 1)
        })
        
        # Label encode item names
        self.label_encoder = LabelEncoder()
        self.df['Item_Encoded'] = self.label_encoder.fit_transform(self.df['Item_name'])
        
        # Prepare features
        self.X = self.df[['Month_Numeric', 'Item_Encoded']]
        self.y = self.df['Amount']

        # Add lag features
        self.X['Previous_Amount'] = self.y.shift(1).fillna(self.y.mean())

    def train_model(self):
        """Advanced model training with cross-validation and imputation"""
        # Impute missing values
        self.imputer = SimpleImputer(strategy='median')
        X_imputed = self.imputer.fit_transform(self.X)
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_imputed)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, self.y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest with more robust parameters
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        self.model.fit(X_train, y_train)

    def predict(self, previous_month, previous_amount, current_month, item):
        """Predict requirement with comprehensive input"""
        try:
            # Convert inputs to appropriate formats
            previous_amount = float(str(previous_amount).replace(',', ''))
            
            # Encode the item
            item_encoded = self.label_encoder.transform([item])[0]
            
            # Prepare input data
            input_data = pd.DataFrame({
                'Month_Numeric': [MONTH_ORDER.index(current_month) + 1],
                'Item_Encoded': [item_encoded],
                'Previous_Amount': [previous_amount]
            })

            # Impute and scale input
            input_imputed = self.imputer.transform(input_data)
            input_scaled = self.scaler.transform(input_imputed)
            
            # Predict and ensure non-negative result
            predicted_amount = self.model.predict(input_scaled)
            return max(0, int(predicted_amount[0]))
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return None

    def add_new_data(self, previous_month, previous_amount, current_month, item):
        """Add new data point and retrain model"""
        try:
            # Prepare new data point
            new_data = pd.DataFrame({
                'Month_name': [current_month],
                'Item_name': [item],
                'Amount': [float(str(previous_amount).replace(',', ''))]
            })
            
            # Append and save updated dataset
            self.df = pd.concat([self.df, new_data], ignore_index=True)
            self.save_dataset()
            
            # Retrain the model with updated data
            self.preprocess_data()
            self.train_model()
            return True
        except Exception as e:
            print(f"Error adding new data: {e}")
            return False

    def save_dataset(self, filename='New_dataset_drugs.csv'):
        """Save updated dataset"""
        self.df.to_csv(filename, index=False)

# Global predictor initialization
requirement_predictor = RequirementPredictor()
requirement_predictor.preprocess_data()
requirement_predictor.train_model()

@app.route('/drugs_inventory_pred', methods=['POST'])
def predict_drugs_inventory():
    """Comprehensive prediction endpoint for drug inventory"""
    try:
        # Extract input data
        data = request.get_json()
        previous_month = data.get('previous_month')  # Use .get() to handle missing fields
        previous_amount = data.get('previous_amount')
        current_month = data['current_month']
        item = data['item']

        if previous_month and previous_amount:  # If previous data is provided
            # Predict requirement based on the previous month and amount
            predicted_amount = requirement_predictor.predict(
                previous_month, 
                previous_amount, 
                current_month, 
                item
            )
        else:
            # Predict based on the original dataset if no previous data is provided
            # Use the most recent data in the dataset to predict
            last_month_data = requirement_predictor.df.iloc[-1]
            previous_month = last_month_data['Month_name']
            previous_amount = last_month_data['Amount']
            
            predicted_amount = requirement_predictor.predict(
                previous_month, 
                previous_amount, 
                current_month, 
                item
            )

        if predicted_amount is not None:
            # Add new data for continuous learning
            requirement_predictor.add_new_data(
                previous_month, 
                previous_amount, 
                current_month, 
                item
            )

            return jsonify({
                'predicted_amount': predicted_amount,              
                'current_month': current_month,
                'item': item,
            })
        else:
            return jsonify({
                'error': 'Unable to generate prediction'
            }), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)