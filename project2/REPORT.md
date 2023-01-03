# Project 2 report

1. [Prerequisites](#Prerequisites)
2. [Running](#Running)
3. [Performance tests result](#Performance tests result)
4. [Reflection](#Reflection)
5. [Improvements](#Improvements)

# Prerequisites

- [Docker](https://www.docker.com/)

# Running

```bash
# start
docker compose up
# if you want to stop, <ctrl-c>
docker compose down

# main page
# When you open the website, you can click login button, which is used to keep track of your state, and enter a username whatever you like. (I have already achieved login feature before announcements said we do not need to create a login page, so I reserve the login page).
http://127.0.0.1:7800 # through nginx
http://127.0.0.1:7778 # original web server


# testing
docker compose --profile test run k6-stress-main
docker compose --profile test run k6-stress-grade
```



## Trouble Shooting

```bash
# if logs show that the relation does not exist, it means that the flyway does not initial database successfully. You can kill all services and restart them. 

```





# Performance tests result

### Testing environment

All tests are done on my own laptop, so the network latency can be ignored.

- CPU: 8-core Apple M1 Pro chip
- Main Memory: 16 GB RAM
- Disk: 512 GB SSD

## Core web vitals

| Test-suite    | Lighthouse Performace score | First Input Delay | Cumulative Layout Shift | Largest Content Paint | First Contentful Paint |
| ------------- | --------------------------- | ----------------- | ----------------------- | --------------------- | ---------------------- |
| main page     | 98                          | 0.5s              | 0                       | 1.1s                  | 0.5s                   |
| exercise page | 96                          | 0.5s              | 0                       | 1.4s                  | 0.5s                   |

## Performance

Assuming 5 users for 10 seconds.

| Test-suite           | avg reqs per sec | med req duration | 95% req duration | 99% req duraion |
| -------------------- | ---------------- | ---------------- | ---------------- | --------------- |
| main page            | 3134/s           | 2.48ms           | 45.1ms           | 47.06ms         |
| submitting exercises | 332/s            | 119.63ms         | 287.77ms         | 852.73ms        |

# Reflection

1. The Lighthouse Performace seems to have a better score because I use React code-splitting for lazy loading.
2. As for the main-page performance test, the results are not good. Part of the reason that I store all data on the server-side, it needs to do network requests when it is opened first.
3. The largest content paint time for the exercise page is a little longer than the main page since there is a markdown render to take time for the exercise page.
4. The performance for submitting exercises is also not good. I guess, one reason is that publishing messages takes longer time due to submission peaks.
5. I use React to build the front-end application. But the performance is maybe better when I use the original DOM api because React will add more unnecessary features to this simple application.





# Improvements

1. It is possible to compress content before sending it to the client. Also, putting some static files into CDN is reasonable. However, compressing static HTML files for our application is fine. If we want to delay our application worldwide, it is nice to apply CDNs.
2. Now, when someone submits their code, the front end will be polling the result from the back end. I believe it is not a good option in practice. Using the websocket or http2 server push feature is a better selection.
3. I use a basic message broker, RabbitMq. But for performance-sensitive applications, it is better to choose other modern message brokers, such as Kafka or pulsar. And also, deploying more consumer workers is beneficial to improve performance. 
4. Though we already deploy a load balancer, a server is deployed. So deploying a few servers is one way to improve the performance. Every request can be directed to a specific server based on some rules, such as Round Robin.
5. If we run the application on a computer with higher performance, the performance of the application will increase as well. 
6. Another optional measure is to deal with the same request using single flight when it comes to submission peaks.

# TODO

1. server-cache should be question-specific instead of user-specific
2. the fetching api address needs to be changed to the server address instead of localhost if you want to deploy in production.
3. when same codes sumit, the server needs only the first request that publishes an message to the message broker and the remaining requests just return. (like singleflight in golang)
