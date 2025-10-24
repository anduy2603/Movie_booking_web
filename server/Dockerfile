# ---------- Base image ----------
    FROM python:3.10-slim

    # ---------- Làm việc trong thư mục /app ----------
    WORKDIR /app
    
    # ---------- Cài các dependency hệ thống cơ bản ----------
    RUN apt-get update && apt-get install -y gcc libsqlite3-dev
    
    # ---------- Copy và cài đặt dependencies ----------
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # ---------- Copy toàn bộ source code ----------
    COPY . .
    
    # ---------- Expose port ----------
    EXPOSE 8000
    
    # ---------- Lệnh khởi chạy ----------
    CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    