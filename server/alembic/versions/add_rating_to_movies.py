"""add_rating_to_movies

Revision ID: add_rating_to_movies
Revises: add_hashed_password
Create Date: 2025-11-04 10:17:28.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_rating_to_movies'
down_revision = 'add_hashed_password'
branch_labels = None
depends_on = None


def upgrade():
    # Add rating column to movies table
    op.add_column('movies', sa.Column('rating', sa.Float(), nullable=True, server_default='0.0'))
    
    # Update existing movies to have rating 0.0 if null
    op.execute("UPDATE movies SET rating = 0.0 WHERE rating IS NULL")


def downgrade():
    # Remove rating column from movies table
    op.drop_column('movies', 'rating')

