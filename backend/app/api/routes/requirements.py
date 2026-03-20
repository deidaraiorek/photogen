from fastapi import APIRouter, HTTPException
from app.data.photo_specs import get_all_specs, get_spec, list_country_codes

router = APIRouter()


@router.get("/requirements")
async def get_requirements():
    return {"countries": get_all_specs()}


@router.get("/requirements/{country_code}")
async def get_country_requirements(country_code: str):
    spec = get_spec(country_code.upper())
    if not spec:
        raise HTTPException(status_code=404, detail=f"Country code '{country_code}' not found")
    return spec


@router.get("/country-codes")
async def get_country_codes():
    return {"codes": list_country_codes()}
