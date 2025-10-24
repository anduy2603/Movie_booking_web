from fastapi import FastAPI
from app.config.settings import settings
from app.controllers import movie_controller, user_controller, booking_controller, room_controller, seat_controller, showtime_controller, theater_controller, favorite_controller, auth_controller
from app.config.error_handler import register_exception_handlers
from app.middleware import setup_middleware

def create_app():
    app = FastAPI(
        title=settings.PROJECT_NAME, 
        version="1.0.0",
        debug=settings.DEBUG,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Setup middleware
    setup_middleware(app)

    # Register Routers 
    app.include_router(movie_controller.router)
    app.include_router(user_controller.router)
    app.include_router(booking_controller.router)
    app.include_router(room_controller.router)
    app.include_router(seat_controller.router)
    app.include_router(showtime_controller.router)
    app.include_router(theater_controller.router)
    app.include_router(favorite_controller.router)
    app.include_router(auth_controller.router)
    
    # Register error handler
    register_exception_handlers(app)

    return app

app = create_app()

@app.get("/")
def root():
    return {"message": "Movie Booking API is running 🚀"}


