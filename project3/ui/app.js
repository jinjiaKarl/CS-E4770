import { serve, serveDir } from "./deps.js";

const handleRequest = async (request) => {
  console.log("aaa", request.url);
  return await serveDir(request, {
    fsRoot: "./frontend/dist",
  });
};
serve(handleRequest, { port: 7778 });
