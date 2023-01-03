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

export default function () {
  const url = __ENV.HOST && __ENV.PORT
    ? `http://${__ENV.HOST}:${__ENV.PORT}`
    : "http://localhost:7778";
  const res = http.get(url);
  check(res, { "status was 200 ": (r) => r.status == 200 });
}
