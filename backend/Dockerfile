FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose the port
EXPOSE 3001

# ✓ CHANGED: Run with spring-boot:run instead of building JAR
# This keeps the app running and allows DevTools to watch for changes
ENTRYPOINT ["./mvnw", "spring-boot:run"]