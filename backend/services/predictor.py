import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import shap
import joblib

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "EasyVisa.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "trained_models", "visa_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "..", "trained_models", "encoders.pkl")

# Columns we use for prediction
FEATURE_COLUMNS = [
    "continent",
    "education_of_employee",
    "has_job_experience",
    "requires_job_training",
    "no_of_employees",
    "yr_of_estab",
    "region_of_employment",
    "prevailing_wage",
    "unit_of_wage",
    "full_time_position"
]

TARGET_COLUMN = "case_status"

# Categorical columns that need encoding
CATEGORICAL_COLUMNS = [
    "continent",
    "education_of_employee",
    "has_job_experience",
    "requires_job_training",
    "region_of_employment",
    "unit_of_wage",
    "full_time_position"
]


# Train the visa approval model and save it
def train_model():
    import mlflow
    import mlflow.sklearn

    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    # Drop case_id since it's not a feature
    df = df.drop(columns=["case_id"])

    # Encode categorical columns
    encoders = {}
    for col in CATEGORICAL_COLUMNS:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    # Encode target column - Certified = 1, Denied = 0
    target_encoder = LabelEncoder()
    df[TARGET_COLUMN] = target_encoder.fit_transform(df[TARGET_COLUMN])
    encoders[TARGET_COLUMN] = target_encoder

    # Split features and target
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Start MLflow run
    mlflow.set_experiment("visa-approval-predictor")
    with mlflow.start_run():
        # Train Random Forest model
        n_estimators = 100
        print("Training Random Forest model...")
        model = RandomForestClassifier(
            n_estimators=n_estimators, random_state=42, n_jobs=-1
        )
        model.fit(X_train, y_train)

        # Evaluate model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Model Accuracy: {accuracy:.4f}")
        print(classification_report(y_test, y_pred, target_names=target_encoder.classes_))

        # Log parameters and metrics to MLflow
        mlflow.log_param("n_estimators", n_estimators)
        mlflow.log_param("test_size", 0.2)
        mlflow.log_param("random_state", 42)
        mlflow.log_metric("accuracy", accuracy)
        mlflow.sklearn.log_model(model, "random_forest_model")

        print(f"MLflow run logged.")

    # Save model and encoders
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODER_PATH)
    print("Model and encoders saved.")

    return model, encoders


# Load saved model and encoders
def load_model():
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    return model, encoders


# Predict visa approval and explain with SHAP
def predict_visa(input_data: dict):
    # Load model
    model, encoders = load_model()

    # Convert input to dataframe
    df_input = pd.DataFrame([input_data])

    # Encode categorical columns using saved encoders
    for col in CATEGORICAL_COLUMNS:
        if col in df_input.columns:
            le = encoders[col]
            df_input[col] = le.transform(df_input[col].astype(str))

    # Make prediction
    X = df_input[FEATURE_COLUMNS]
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0]

    # Decode prediction label
    target_encoder = encoders[TARGET_COLUMN]
    predicted_label = target_encoder.inverse_transform([prediction])[0]

    # SHAP explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # Handle SHAP output shape correctly
    if isinstance(shap_values, list):
        shap_vals = shap_values[-1][0]
    else:
        shap_vals = shap_values[0]

    # Make sure shap_vals is 1D array
    shap_vals = np.array(shap_vals).flatten()

    # Map feature names to SHAP values
    shap_explanation = {
        FEATURE_COLUMNS[i]: round(float(shap_vals[i]), 4)
        for i in range(len(FEATURE_COLUMNS))
    }

    # Map feature names to SHAP values
    shap_explanation = {
        FEATURE_COLUMNS[i]: round(float(shap_vals[i]), 4)
        for i in range(len(FEATURE_COLUMNS))
    }

    # Sort by absolute importance
    shap_explanation = dict(
        sorted(shap_explanation.items(), key=lambda x: abs(x[1]), reverse=True)
    )

    return {
        "prediction": predicted_label,
        "confidence": {
            "Denied": round(float(probability[0]), 4),
            "Certified": round(float(probability[1]), 4)
        },
        "shap_explanation": shap_explanation
    }