FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://backend:8080;\n\
    }\n\
    location /_matrix/ {\n\
        proxy_pass http://synapse:8008;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
