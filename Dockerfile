FROM node
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm install
COPY . ./
ENTRYPOINT npm run dev -- --host 0.0.0.0 --port 5000
