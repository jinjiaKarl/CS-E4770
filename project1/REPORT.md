

# URL Shortener

1. [Prerequisites](#Prerequisites)
2. [Running](#Running)
3. [Performance tests result](#Performance tests result)
4. [Reflection](#Reflection)
5. [Improvements](#Improvements)



## Prerequisites

* [Docker](https://www.docker.com/)
* [npm](https://www.npmjs.com/package/npm)

## Running

Three versions of url shortener are provided. and the directories structure are below.

```bash
$ tree -L 1
├── REPORT.md
├── benchmark
├── deno_oak
├── flyway
├── go_gin
├── node_express
└── shorten_url_frontend
```



> Note: 
>
> The `depends_on` in the `docker-compose.yml` does not wait for `db` to be ready before starting `application`. It only ensures the order of running containers, instead of ready status. So it is possible to get an error when we start the application at the beginning.  That `flyway` container exits means that it could be successful to get responses from the server. 
>
> I don't handle this problem, because it is not the point for this course. But there are a few ways to solve this, if you are interested, check this [doc](https://docs.docker.com/compose/startup-order/).

### front-end

```bash
# compile
$ cd shorten_url_frontend
$ npm install
$ npm run build
```



### deno+oak

```bash
# execute the applition
$ cd deno_oak
$ cp -r ../shorten_url_frontend/build .
$ docker compose up -d
$ cd ../benchmark
# execute performance tests
# if you notice the http_req_failed is 100%, please wait a few seconds and try again. The reason is the note above.
$ docker run --rm -i --network=host grafana/k6 run - <main_page.js
$ docker run --rm -i --network=host grafana/k6 run - <submit.js
$ docker run --rm -i --network=host grafana/k6 run - <redirect.js
$ docker run --rm -i --network=host grafana/k6 run - <random.js
$ cd ../deno_oak
$ docker compose down
```

### node+express

```bash
# execute the applition
$ cd node_express
$ cp -r ../shorten_url_frontend/build .
$ docker compose up -d
$ cd ../benchmark
# if you notice the http_req_failed is 100%, please wait a few seconds and try again. The reason is the note above.
$ docker run --rm -i --network=host grafana/k6 run - <main_page.js
$ docker run --rm -i --network=host grafana/k6 run - <submit.js
$ docker run --rm -i --network=host grafana/k6 run - <redirect.js
$ docker run --rm -i --network=host grafana/k6 run - <random.js
$ cd ../node_express
$ docker compose down
```



### go+gin

```bash
# execute the applition
$ cd go_gin
$ cp -r ../shorten_url_frontend/build .
$ docker compose up -d
$ cd ../benchmark
# if you notice the http_req_failed is 100%, please wait a few seconds and try again. The reason is the note above.
$ docker run --rm -i --network=host grafana/k6 run - <main_page.js
$ docker run --rm -i --network=host grafana/k6 run - <submit.js
$ docker run --rm -i --network=host grafana/k6 run - <redirect.js
$ docker run --rm -i --network=host grafana/k6 run - <random.js
$ cd ../go_gin
$ docker compose down
```



## Performance tests result

### Testing environment

All tests are done on my own laptop, so the network latency can be ignored.

* CPU: 8-core Apple M1 Pro chip
* Main Memory: 16 GB RAM
* Disk: 512 GB SSD

I chose two technologies to generate short url.

1. Take advantage of the incremental primary key in database. Results correspond to **submitting the form(db)** below
2. Generate fixed length random strings. Results correspond to **submitting the form(random)** below

Assuming 10 users for 20 seconds. 

### deno+oak

|                             | avg reqs per sec | med req duration | 95% req duration | 99% req duraion |
| --------------------------- | ---------------- | ---------------- | ---------------- | --------------- |
| main page                   | 17640/s          | 511µs            | 779µs            | 1.33ms          |
| submitting the form(db)     | 153/s            | 63.38ms          | 77.49ms          | 114.05ms        |
| submitting the form(random) | 712/s            | 12.29ms          | 23ms             | 47.05ms         |
| random                      | 1239/s           | 7.72ms           | 10.42ms          | 13.38ms         |
| redirection                 | 1146/s           | 8.35ms           | 10.97ms          | 16.25ms         |



### node+express

|                             | avg reqs per sec | med req duration | 95% req duration | 99% req duraion |
| --------------------------- | ---------------- | ---------------- | ---------------- | --------------- |
| main page                   | 11003/s          | 823µs            | 1.34ms           | 1.88ms          |
| submitting the form(db)     | 615/s            | 14.7ms           | 23.34ms          | 54.28ms         |
| submitting the form(random) | 733/s            | 11.07ms          | 19.21ms          | 27.16ms         |
| random                      | 2543/s           | 3.43ms           | 7.28ms           | 10.1ms          |
| redirection                 | 4164/s           | 2.23ms           | 3.66ms           | 5.11ms          |



### go+gin

|                             | avg reqs per sec | med req duration | 95% req duration | 99% req duraion |
| --------------------------- | ---------------- | ---------------- | ---------------- | --------------- |
| main page                   | 47021/s          | 127µs            | 385µs            | 1.03ms          |
| submitting the form(db)     | 277/s            | 28.1ms           | 81.93ms          | 106.98ms        |
| submitting the form(random) | 401/s            | 19.07ms          | 65.45ms          | 81.67ms         |
| random                      | 601/s            | 13.25ms          | 42.66ms          | 59.49ms         |
| redirection                 | 1412/s           | 2.03ms           | 43.98ms          | 59.05ms         |





## Reflection

1. As for fecting main page, go+gin has the best performace. Because golang is a staic language, javascript is a dynamic language, which means when we execute codes writted by javascript, the interpreter needs to interprete codes line by line.
2. When it comes to generating short urls, using incremental ids has not better performance than generating random strings. Because using incremental ids  needs more operations with database.
3. In terms of all operations about database, for example, random that requires read opertions, go+gin has bad perfroamce. Because I picked up GORM framework, which is a higher abstract to interacte with database, to use for the go+gin application. Howerer I use the offical postgress library for the other two clones.
4. For node and deno, the drivers to interacte with pg have different implementations. Due to the testing results, it is possible that the pg driver of Node put a lot of effert on performance improvement. 
5. Deno is a secure runtime for Javascript, Typescirpt and WebAssembly that uses V8 and is built in Rust. However Node.js uses V8 and is built in C++.  And go is bootstrapped. So they have various performace differences.



## Improvements

1. Our testing is parallel, so we can ues a connection pool to connect database. Bacause if we just use one connection and there are a lot of read opearations, the read opeartion has to wait for the previous one to finish.
2. If some collums that are accessed usually do not have index, we are supposed to create index for these fields to impove our read performance. For our shorten application, it is better to create index for short url in the database because we have to query short qurl to find the match long url.
3. We can cache database results in the client-side or server-side. In practice, we can implement it both. For http, there are http cache headers to use. In the server-side, some in-memeory databases can be used, for example, Redis. However, it is enough to implement appcaiotn-level cache using a map for small applications. For the shorten url application, using map to cache database results is enough.
4. For some suitaions, it is possible to compress content before sending it to the client. Also, puting some static files to CDN is reasonable. However, compressing static html file for our application is fine. If we want to delay our applicaiton worldwide, it is nice to apply CDNs.
5. If we run the applicaiton on a computer with higher performace, the performace of application will increase as well.
6. We can deloy a load balancer and a few servers, so every request can be directed to a specific server baased on some rules, such as Round Robin.


## TODO

1. The front-end applicaiton are dockeried as well.

2. Write one docker compose file to run all three applications, which runs at different ports.

3. The performace tests are dockeried in the docker compose file.
