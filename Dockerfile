FROM node
WORKDIR /app
ENTRYPOINT npm i && npm run dev -- --host 0.0.0.0 --port 5000
