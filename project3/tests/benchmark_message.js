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

// need initial data below 20
export function setup() {
  const url = __ENV.BHOST && __ENV.BPORT
    ? `http://${__ENV.BHOST}:${__ENV.BPORT}`
    : "http://localhost:7777";

  let payload = JSON.stringify({
    token: "test",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  http.post(`${url}/login`, payload, params);

  payload = JSON.stringify({
    token: "test",
    message: "initial message",
  });
  http.post(`${url}/message`, payload, params);
}

export default function () {
  const url = __ENV.HOST && __ENV.PORT
    ? `http://${__ENV.HOST}:${__ENV.PORT}/#/messages/1`
    : "http://hello.info/#/messages/1";
  const res = http.get(url);
  check(res, { "status was 200 ": (r) => r.status == 200 });
}
