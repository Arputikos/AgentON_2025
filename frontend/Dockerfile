FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Build the application with all checks disabled
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build -- --no-lint

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 