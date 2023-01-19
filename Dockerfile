# base has only npm setup. It requires the directory to be mounted.
FROM node as base
WORKDIR /app
COPY package*.json ./
RUN npm i
ENTRYPOINT npm run dev

# full is a standalone image.
FROM base as full
COPY . ./
