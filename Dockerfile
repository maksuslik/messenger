FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml ./

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]