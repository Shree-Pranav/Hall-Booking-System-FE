FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_AUTH_API_BASE_URL
ARG VITE_BOOKING_API_BASE_URL
ENV VITE_AUTH_API_BASE_URL=$VITE_AUTH_API_BASE_URL
ENV VITE_BOOKING_API_BASE_URL=$VITE_BOOKING_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
