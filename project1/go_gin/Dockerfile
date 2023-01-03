ARG GO_VERSION=1.17

FROM golang:${GO_VERSION}-alpine AS builder

WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o shortener .

# FROM alpine:latest

# WORKDIR /app
# COPY --from=builder /app/shortener ./
# COPY --from=builder /app/cfg.json ./
# COPY --from=builder /app/build ./

EXPOSE 7777

ENTRYPOINT ["./shortener"]