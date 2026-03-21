import json
import os
from functools import lru_cache


def _find_specs():
    d = os.path.dirname(os.path.abspath(__file__))
    for _ in range(5):
        candidate = os.path.join(d, "shared", "photo_requirements.json")
        if os.path.exists(candidate):
            return candidate
        d = os.path.dirname(d)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../shared/photo_requirements.json")


SPECS_PATH = _find_specs()


@lru_cache(maxsize=1)
def load_specs() -> dict:
    with open(SPECS_PATH, "r") as f:
        return json.load(f)


def get_all_specs() -> dict:
    return load_specs()["countries"]


def get_spec(country_code: str) -> dict | None:
    return load_specs()["countries"].get(country_code)


def list_country_codes() -> list[str]:
    return list(load_specs()["countries"].keys())
