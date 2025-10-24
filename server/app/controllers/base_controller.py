# # app/controllers/base_controller.py
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List
# from app.config.database import get_db

# class BaseController:
#     def __init__(self, router_prefix: str):
#         self.router = APIRouter(prefix=router_prefix)

#     def register_crud_routes(self, service, schema_create, schema_update, schema_out):
#         router = self.router

#         @router.get("/", response_model=List[schema_out])
#         def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#             return service.get_all(db, skip, limit)

#         @router.get("/{id}", response_model=schema_out)
#         def read_one(id: int, db: Session = Depends(get_db)):
#             obj = service.get(db, id)
#             if not obj:
#                 raise HTTPException(status_code=404, detail="Item not found")
#             return obj

#         @router.post("/", response_model=schema_out, status_code=status.HTTP_201_CREATED)
#         def create_item(obj_in: schema_create, db: Session = Depends(get_db)):
#             return service.create(db, obj_in)

#         @router.put("/{id}", response_model=schema_out)
#         def update_item(id: int, obj_in: schema_update, db: Session = Depends(get_db)):
#             obj = service.update(db, id, obj_in)
#             if not obj:
#                 raise HTTPException(status_code=404, detail="Item not found")
#             return obj

#         @router.delete("/{id}", response_model=schema_out)
#         def delete_item(id: int, db: Session = Depends(get_db)):
#             obj = service.delete(db, id)
#             if not obj:
#                 raise HTTPException(status_code=404, detail="Item not found")
#             return obj

#         return router
