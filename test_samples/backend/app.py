"""Sample Backend Service for DevLens testing."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Sample Inventory Service")


class Item(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None


class ItemService:
    """Manages item business logic and simulated data store."""

    def __init__(self) -> None:
        self.items: dict[int, Item] = {}

    def add_item(self, item: Item) -> Item:
        self.items[item.id] = item
        return item

    def get_all(self) -> List[Item]:
        return list(self.items.values())

    def remove_item(self, item_id: int) -> bool:
        if item_id in self.items:
            del self.items[item_id]
            return True
        return False


service = ItemService()


def calculate_discount(price: float, rate: float = 0.1) -> float:
    """Calculates discounted price."""
    return price * (1.0 - rate)


@app.get("/api/items", tags=["Items"])
async def list_items() -> List[Item]:
    """Retrieve all inventory items."""
    return service.get_all()


@app.post("/api/items", tags=["Items"])
async def create_item(item: Item) -> Item:
    """Create a new item in inventory."""
    return service.add_item(item)


@app.get("/api/items/{item_id}", tags=["Items"])
async def get_item_by_id(item_id: int) -> Item:
    """Fetch single item by identifier."""
    if item_id not in service.items:
        raise HTTPException(status_code=404, detail="Item not found")
    return service.items[item_id]


@app.delete("/api/items/{item_id}", tags=["Items"])
def delete_item(item_id: int) -> dict:
    """Remove item from inventory."""
    success = service.remove_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True, "id": item_id}
