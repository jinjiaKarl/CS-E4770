import http from 'k6/http';
import { check } from 'k6';
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
    duration: "20s",
    vus: 10,
    // metrics
    // 1. avg reqs per second
    // 2. median, 95%, 99% reqs duration
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.99)', 'count'],
}

export default function () {
    const url = 'http://localhost:7777/shorten'
    const payload = JSON.stringify({
        url: generateUrl()
    })
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    http.post(url, payload, params)
}

function generateUrl() {
    return `http://${uuidv4()}.com` 
}