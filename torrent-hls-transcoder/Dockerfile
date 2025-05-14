FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

RUN pip install flask

CMD ["python", "app.py"]