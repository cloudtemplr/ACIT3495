FROM node:16
WORKDIR /app
RUN apt-get update && apt-get install -y curl \
    && curl -sSL https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz | tar -xz -C /usr/local/bin
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
