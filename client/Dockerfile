FROM node:20-alpine3.19

RUN apk add --no-cache python3 make g++

WORKDIR /home/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev", "--", "--host" ]