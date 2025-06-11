# predict_fraud.py
import joblib

# Load the model
model = joblib.load('fraud_model.joblib')

def predict_fraud(title, description, requirements='', benefits=''):
    text = ' '.join([title, description, requirements, benefits])
    return bool(model.predict([text])[0])  # returns True if fraudulent
