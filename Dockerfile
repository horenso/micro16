# base is for development, it requires that the directory is mounted into /app.
FROM node as base
WORKDIR /app
ENTRYPOINT npm i && chmod -R 777 node_modules && npm run dev

# To test with the directory mounted into /app.
FROM base as test
ENTRYPOINT npm i && chmod -R 777 node_modules && npm run test

# full image that builds the app to static html/css/js and hosts it with nginx
FROM base as builder
WORKDIR /app
COPY package*.json /app/
RUN npm i
COPY . ./
RUN npm run build

FROM nginx as host
COPY --from=builder /app/dist /usr/share/nginx/html
ENTRYPOINT ["nginx-debug", "-g", "daemon off;"]