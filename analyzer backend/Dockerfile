# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile for the Spring Boot backend
# Located in:  analyzer backend/
# Java 21 + Maven 3.9
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build the fat JAR ────────────────────────────────────────────────
FROM docker.io/library/maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache Maven dependencies separately from source
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build (skip tests — run them in CI, not in Docker build)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Slim runtime image ───────────────────────────────────────────────
FROM docker.io/library/eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/analyzer-*.jar app.jar

EXPOSE 8080

# Use exec form so signals (SIGTERM) are forwarded correctly for graceful shutdown
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
