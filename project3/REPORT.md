# Project 3 report

1. [Prerequisites](#Prerequisites)
2. [Running](#Running)
3. [Performance tests result](#Performance tests result)
4. [Reflection](#Reflection)
5. [Improvements](#Improvements)

# Prerequisites

- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)
- [minikube](https://minikube.sigs.k8s.io/docs/start/)

# Running

There are two options to start this project.

## Docker-compose

```bash
# 1.using docker-compose
# start
docker compose up
# if you want to stop, <ctrl-c>
docker compose down

# main page
http://127.0.0.1:7800

# testing
docker compose --profile test run k6-stress-main
docker compose --profile test run k6-stress-message
docker compose --profile test run k6-stress-add-message
docker compose --profile test run k6-stress-add-reply
```

## Kubernetes

```bash
# 2.using k8s
minikube start --extra-config=kubelet.housekeeping-interval=10s
eval $(minikube -p minikube docker-env)
minikube addons enable ingress
minikube addons enable metrics-server
minikube tunnel
minikube dashboad
# build images, if something goes wrong, please execute this again
cd kubernetes 
chmod +x build_images.sh && ./build_images.sh
# install cloud native pg
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.18/releases/cnpg-1.18.0.yaml
# install rabbitmq
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
# start services
chmod +x start.sh && ./start.sh

# main page
sudo -i
# You should see an IPv4 address in the ADDRESS column, this can take a couple of minutes.
kubectl get ingress
# NOTE: if your laptop is M1 chip, you should use ADDR=127.0.0.1, because it doesn't support M1 chip very well. You can check https://github.com/kubernetes/minikube/issues/13510
ADDR=$(minikube ip)
echo "${ADDR} hello.info" >> /etc/hosts
hello.info # main page

# if you want to scale CloudNative PG because the cluster resource does not support autoscale.
kubectl scale --replicas=3 cluster database-cluster
# if you want to verify autoscale, just increase work load
kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://api-service:7777; done"
kubectl get hpa api --watch
# it is possible to see pedding pods because of "insufficient cpu"
# you can execute `kubectl describe nodes` to see what resources have been allocated.


# testing
cd tests
k6 run benchmark_main.js
k6 run benchmark_message.js
k6 run benchmark_add_message.js
k6 run benchmark_add_reply.js

 
# clean services
chmod +x clean.sh && ./clean.sh
```

## Key Features Design

When I implement the feature that scrolling down on the main page retrieves more
messages, I use the following technologies.

- back-end: adopt `NextToken` and `MaxResults` for pagination options to
  implement API. Because we don't need to be precise to specific page numbers, I
  don't use `PageSize` and `PageNumber`, which is not efficient when it comes to
  a great number of data.
- front-end: adopt `IntersectionObserver API` to fetch more data when the buttom
  element appears. There are `Scoroll Down` logs when you can open the Developer
  Tools on Chrome, which means that you can see the buttom element.

When I implement the feature that new messages, replise or up or downvotes,
shown content is updated.

- adopt `Server Sent Event` to implement server push instead of using websocket.
  Because `Server Sent Event` only allows that servers send messages to clients,
  which means it is unidirectional. I think it is more suitable for our
  circumstance than websocket.
- adopt `rabbitmq` to serve as a bridge between servers and clients to send
  updated message. Because there are multiple application server pods.

When I deloy apps on kubernetes, I decieded to write different configuration
files for vaious services instead of putting all inito one file. Because the
structrue is clear and easy to apply or delete specific files. Also putting into
all things into one file is nice.

When I deploy databases on kubernetes, there are two options to initialize the
database. One is to execute a kubernetes job using flyway. The other one is to
configure it using the configure map. I choose the latter.

## Trouble Shooting

```bash
# 1.when server sends message to an idle connection, it shows this following error, beacause the server does not know the client end that is dead. This is an expected behavior that does not affect the result of this application.
#//    at Object.respondWith (deno:ext/http/01_http.js:316:27)
#// [uncaught application error]: Http - connection closed before message completed

# 2.Sometimes, when you ues docker-compose to deploy and try to access 127.0.0.1:7800/api, you get an error called 502 Bad Gateway on the dev console. You just restart web container and then it works. To be honest, I do not konw the reason. If you know the reason, please write it on the feedback. Thanks a lot. 


# 3.Sometimes, when you use k8s to deploy, the database doesn't work. `Error: PGData directories already exist`
# the simplest way is to excute `minikube delete` and start again. Or you can just delete the PGData on Dashbord and start again.
```

# Performance tests result

### Testing environment

All tests are done on my own laptop, so the network latency can be ignored.

- CPU: 8-core Apple M1 Pro chip
- Main Memory: 16 GB RAM
- Disk: 512 GB SSD

## Core web vitals

| Test-suite   | Lighthouse Performace score | First Input Delay | Cumulative Layout Shift | Largest Content Paint | First Contentful Paint |
| ------------ | --------------------------- | ----------------- | ----------------------- | --------------------- | ---------------------- |
| main page    | 98                          | 0.6s              | 0                       | 1.2s                  | 0.6s                   |
| message page | 99                          | 0.5s              | 0.003                   | 1.0s                  | 0.5s                   |

## Performance

Assuming 5 users for 10 seconds.

| Test-suite   | avg reqs per sec | med req duration | 95% req duration | 99% req duraion |
| ------------ | ---------------- | ---------------- | ---------------- | --------------- |
| main page    | 589              | 6.48ms           | 12.86ms          | 28.09ms         |
| message page | 524              | 6.87ms           | 14.29ms          | 28.34ms         |
| add message  | 61               | 52.02ms          | 146.57ms         | 329.37ms        |
| add reply    | 125              | 31.57ms          | 73.56ns          | 142.74ms        |

# Reflection

1. The Lighthouse Performace seems to have a better score thanks to simple page
   structure.
2. The UI is simple and not really user-friendly, it needs more styles to make
   it more nice. And I also don't take time zone into consideration and just use
   UTC+0 for simplicity.
3. As for the main-page performance test, the results are not good. Part of the
   reason that I store all data on the server-side, it needs to do network
   requests when it is opened first.
4. The performance for add messages and replies is also not good. I guess, one
   reason is that publishing messages takes longer time due to peak time.
5. I use React to build the front-end application. But the performance is maybe
   better when I use the original DOM api because React will add more
   unnecessary features to this simple application.

# Improvements

1. It is possible to compress content before sending it to the client. Also,
   putting some static files into CDN is reasonable. However, compressing static
   HTML files for our application is fine. If we want to delay our application
   worldwide, it is nice to apply CDNs.
2. Now, I do not creat any index for database, but it is a great way to create
   index for some columns aiming improve performance.
3. I use a basic message broker, RabbitMq. But for performance-sensitive
   applications, it is better to choose other modern message brokers, such as
   Kafka or pulsar.
4. If we run the application on a computer with higher performance, the
   performance of the application will increase as well.
5. Another optional measure is to deploy services into different physical
   servers instead of being deploying one server.
6. Now the consumer has one limitation, it has only one pod. Because the
   frontend just connects the exposed service that only connects one pod instead
   of all pods. I have one solution that the backend using k8s client library
   selects all pod based on label selector and then sends to the frontend. I
   won't deal with this problem dut to the limited time but I think there are
   more reasonable solutions.
