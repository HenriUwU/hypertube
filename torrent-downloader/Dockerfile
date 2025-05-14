FROM python:3.11-slim

WORKDIR /app
COPY . .
RUN pip install flask torrentp requests

CMD ["python", "app.py"]