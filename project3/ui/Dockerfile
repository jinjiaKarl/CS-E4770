FROM node:19-alpine3.15 AS builder

WORKDIR /app
COPY ./frontend .
RUN  npm install && npm run build

FROM lukechannings/deno:v1.26.2

EXPOSE 7778

WORKDIR /app

COPY . .
COPY --from=builder /app/dist ./frontend/dist

RUN deno cache deps.js
 
CMD [ "run", "--watch",  "--allow-net", "--allow-read", "--allow-env", "--no-check", "app.js" ]