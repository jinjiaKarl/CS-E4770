#!/bin/bash
kubectl delete -f database-config.yaml
#kubectl delete -f database-migration-job.yaml
kubectl delete -f rabbitmq-config.yaml
kubectl delete -f api.yaml
kubectl delete -f api-service.yaml
kubectl delete -f consumer.yaml
kubectl delete -f consumer-service.yaml
kubectl delete -f ui.yaml
kubectl delete -f ui-service.yaml
kubectl delete -f nginx-ingress.yaml