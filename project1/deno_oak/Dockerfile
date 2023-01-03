FROM lukechannings/deno:v1.26.2

EXPOSE 7777

WORKDIR /app

COPY . .

RUN deno cache app.js

CMD [ "run", "--allow-env", "--allow-net", "--watch", "--allow-read", "app.js" ]
