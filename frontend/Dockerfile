FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Expose port 5173
EXPOSE 5173

# Run dev server with hot reloading instead of build + preview
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]