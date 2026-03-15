import shap
import numpy as np
from services.predictor import load_model, FEATURE_COLUMNS
import pandas as pd

model, encoders = load_model()
X = pd.DataFrame([[0,3,1,0,500,2000,0,80000,3,1]], columns=FEATURE_COLUMNS)

prediction = model.predict(X)[0]
print("prediction value:", prediction)
print("prediction type:", type(prediction))

probability = model.predict_proba(X)[0]
print("probability:", probability)

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)
print("shap type:", type(shap_values))
print("shap shape:", np.array(shap_values).shape)
print("shap_values[0, :, prediction]:", np.array(shap_values)[0, :, prediction])