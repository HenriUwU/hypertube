# FROM openjdk:21-jdk-slim
FROM openjdk:24-ea-21-jdk-slim-bullseye

RUN apt-get update && \
    apt-get install -y ffmpeg

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

COPY src ./src

CMD ["./mvnw", "spring-boot:run"]