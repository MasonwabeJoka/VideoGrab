FROM node:18-alpine

# Install system dependencies, yt-dlp, and ffmpeg
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    ca-certificates \
    && pip3 install --break-system-packages --upgrade pip \
    && pip3 install --break-system-packages --upgrade yt-dlp

# Verify yt-dlp installation and version
RUN yt-dlp --version && echo "yt-dlp installed successfully"

# Set up Node.js app
WORKDIR /app
COPY package*.json ./

# Install npm dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Environment variables for proxy configuration
ENV PROXY_LIST=""
ENV MIN_REQUEST_INTERVAL=2000
ENV MAX_CONCURRENT_DOWNLOADS=3

EXPOSE 3000
CMD ["npm", "start"]
