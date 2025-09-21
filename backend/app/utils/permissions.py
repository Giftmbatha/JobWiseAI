from fastapi import HTTPException, Depends
from app.utils.dependencies import get_current_user

def require_employer_role(current_user = Depends(get_current_user)):
    if current_user.role not in ['EMPLOYER', 'ADMIN']:
        raise HTTPException(status_code=403, detail="Employer access required")
    return current_user