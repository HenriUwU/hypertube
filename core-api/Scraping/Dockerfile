FROM node:23-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/theriturajps/Torrent-Search-API.git
WORKDIR /Torrent-Search-API
RUN npm install

CMD ["npm", "start"]