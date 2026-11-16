FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# El comando (API de productos o de usuarios) lo indica docker-compose.yml
