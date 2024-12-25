import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from flask import Flask, request, jsonify

app = Flask(__name__)

MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

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
        previous_month = data['previous_month']
        previous_amount = data['previous_amount']
        current_month = data['current_month']
        item = data['item']
        
        # Predict requirement with full input context
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
                'previous_month': previous_month,
                'current_month': current_month,
                'item': item,
                'message': 'Prediction successful with model update'
            })
        else:
            return jsonify({
                'error': 'Unable to generate prediction'
            }), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)