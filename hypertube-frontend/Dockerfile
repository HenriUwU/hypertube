FROM node:22.13.1-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm install -g @angular/cli

CMD [ "npm", "run", "start-docker" ]
# same as "ng serve --host 0.0.0.0 --port 4200
