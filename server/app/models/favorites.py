from sqlalchemy import Table, Column, Integer, ForeignKey
from .base_model import Base

favorites = Table(
    "favorites",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("movie_id", Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True),
)
 