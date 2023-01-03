#!/bin/bash
cd ../api &&  minikube image build -t api .
cd ../consumer && minikube image build -t consumer .
cd ../flyway && minikube image build -t flyway-migrations .
cd ../ui && minikube image build -t ui .
