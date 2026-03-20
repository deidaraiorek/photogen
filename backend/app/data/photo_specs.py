import json
import os
from functools import lru_cache

SPECS_PATH = os.path.join(os.path.dirname(__file__), "../../../shared/photo_requirements.json")


@lru_cache(maxsize=1)
def load_specs() -> dict:
    path = os.path.abspath(SPECS_PATH)
    with open(path, "r") as f:
        return json.load(f)


def get_all_specs() -> dict:
    return load_specs()["countries"]


def get_spec(country_code: str) -> dict | None:
    return load_specs()["countries"].get(country_code)


def list_country_codes() -> list[str]:
    return list(load_specs()["countries"].keys())
