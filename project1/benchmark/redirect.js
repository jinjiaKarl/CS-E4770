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

export function setup () {
    const url = 'http://localhost:7777/shorten'
    const payload = JSON.stringify({
        url: "http://google.com"
    })
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    const data = http.post(url, payload, params)
    return data.json()
}

export default function (data) {
    const url = data.url
    http.get(url, {redirects:0}) // disable redirect
}