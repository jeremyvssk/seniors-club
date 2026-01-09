FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Expose port 5173
EXPOSE 5173

# Run Vite preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]