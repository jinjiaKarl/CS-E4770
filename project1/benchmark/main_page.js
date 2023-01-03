import http from 'k6/http';
import { check } from 'k6';


export const options = {
    duration: "20s",
    vus: 10,
    // metrics
    // 1. avg reqs per second
    // 2. median, 95%, 99% reqs duration
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.99)', 'count'],
}

export default function () {
    const url = 'http://localhost:7777'
    const res = http.get(url)
}
