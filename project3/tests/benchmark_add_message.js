import http from "k6/http";
import { check } from "k6";
export const options = {
  duration: "10s",
  vus: 5,
  summaryTrendStats: [
    "avg",
    "min",
    "med",
    "max",
    "p(95)",
    "p(99)",
    "p(99.9)",
    "count",
  ],
};
export function setup() {
  const url = __ENV.HOST && __ENV.PORT
    ? `http://${__ENV.HOST}:${__ENV.PORT}`
    : "http://localhost:7777";

  const payload = JSON.stringify({
    token: "test",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  http.post(`${url}/login`, payload, params);
}

export default function () {
  const url = __ENV.HOST && __ENV.PORT
    ? `http://${__ENV.HOST}:${__ENV.PORT}/message`
    : "http://localhost:7777/message";
  const payload = JSON.stringify({
    token: "test",
    message: "hello world test",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = http.post(url, payload, params);
  check(res, { "status was 200 ": (r) => r.status == 200 });
}
