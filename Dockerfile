# base has only npm setup. It requires the directory to be mounted.
FROM node as base
WORKDIR /app
ENTRYPOINT npm i && npm run dev

# full is a standalone image.
FROM base as full
COPY . ./
RUN npm i
ENTRYPOINT npm run dev