# Stage 1: Build the React Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Flask + Selenium
FROM python:3.11-slim
WORKDIR /app

# Install Chrome + dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxshmfence1 \
    libxfixes3 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
# Install Google Chrome (modern Debian way)
RUN wget -q https://dl.google.com/linux/linux_signing_key.pub \
    && gpg --dearmor -o /usr/share/keyrings/google-linux-keyring.gpg linux_signing_key.pub \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-keyring.gpg] \
    http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* \
    && rm linux_signing_key.pub

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Copy built frontend
COPY --from=build /app/dist ./client/dist

EXPOSE 5000

ENV FLASK_APP=server.py
ENV FLASK_ENV=production

CMD ["python", "server.py"]
