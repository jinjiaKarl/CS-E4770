FROM node:19-alpine3.15 AS builder

WORKDIR /app
COPY . .
RUN  npm install

EXPOSE 7778
 
CMD [ "npm", "run",  "dev"]