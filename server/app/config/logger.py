import logging
import sys

# Cấu hình logger chuẩn toàn hệ thống
logger = logging.getLogger("movie_booking")
logger.setLevel(logging.INFO)

# Nếu chưa có handler, thêm handler tránh log bị trùng
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "[%(asctime)s] | %(levelname)-8s | %(name)s | %(funcName)s | %(message)s",
        "%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Cho phép import như logger.info(...)
def info(msg: str, *args, **kwargs):
    logger.info(msg, *args, **kwargs)

def error(msg: str, *args, **kwargs):
    logger.error(msg, *args, **kwargs)

def warning(msg: str, *args, **kwargs):
    logger.warning(msg, *args, **kwargs)

def debug(msg: str, *args, **kwargs):
    logger.debug(msg, *args, **kwargs)
