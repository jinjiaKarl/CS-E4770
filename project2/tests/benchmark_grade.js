import http from "k6/http";
import { check } from "k6";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
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
    ? `http://${__ENV.HOST}:${__ENV.PORT}/login`
    : "http://localhost:7777/login";
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const data = JSON.stringify({
    username: "test",
  });
  const res = http.post(url, data, params);
  return res.json();
}

export default function (data) {
  const url = __ENV.HOST && __ENV.PORT
    ? `http://${__ENV.HOST}:${__ENV.PORT}/grade`
    : "http://localhost:7777/grade";
  const payload = JSON.stringify({
    code: uuidv4(),
    exercise_id: 1,
    user_id: 1,
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
    },
  };
  const res = http.post(url, payload, params);
  check(res, { "status was 200 ": (r) => r.status == 200 });
}
