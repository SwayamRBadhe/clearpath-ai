from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.predictor import predict_visa

# Create router
router = APIRouter(prefix="/visa", tags=["Visa Predictor"])


# Request body - matches the features in our dataset
class VisaRequest(BaseModel):
    continent: str
    education_of_employee: str
    has_job_experience: str
    requires_job_training: str
    no_of_employees: int
    yr_of_estab: int
    region_of_employment: str
    prevailing_wage: float
    unit_of_wage: str
    full_time_position: str


# Predict visa approval
@router.post("/predict")
def predict(request: VisaRequest):
    try:
        result = predict_visa(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))