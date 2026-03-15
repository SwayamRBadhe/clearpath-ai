from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from services.auth import verify_token

# OAuth2 scheme - points to the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# Extract current user email from JWT token
def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return payload.get("sub")