# base is for development, it requires that the directory is mounted into /app.
FROM node as base
WORKDIR /app
ENTRYPOINT npm i && chmod -R 777 node_modules && npm run dev

# To test with the directory mounted into /app.
FROM base as test
ENTRYPOINT npm i && chmod -R 777 node_modules && npm run test

# full is a standalone image.
FROM base as full
COPY package*.json /app/
RUN npm i
COPY . ./
ENTRYPOINT npm run dev