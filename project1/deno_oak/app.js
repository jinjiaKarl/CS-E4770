import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import {shorten, redirect, random} from "./controller.js"
import { printInfo } from "./utils.js"
import cfg from "./cfg.json" assert { type: "json" };
import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts";

async function start() {
    const router = new Router()
    router
      .post("/shorten", (ctx) => shorten(ctx))
      .get("/random", (ctx) => random(ctx))
      .get("/:shortId", (ctx) => redirect(ctx))
     
  
    const app = new Application()
    app.use(staticFiles("build"))
    app.use(router.routes())
    app.use(router.allowedMethods())
  
    printInfo(`Starting server on :${cfg.serverPort}`)
    await app.listen({port: cfg.serverPort})
}

await start()