from fastapi import APIRouter
from typing import List, Dict, Any
from ..data.seed_data import DATA_SOURCES_SEED

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])

@router.get("")
def list_data_sources() -> List[Dict[str, Any]]:
    """Returns official and public data source integration statuses and metadata."""
    results = []
    for idx, d in enumerate(DATA_SOURCES_SEED, 1):
        item = dict(d)
        item["id"] = idx
        results.append(item)
    return results
