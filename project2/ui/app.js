import { serve, serveDir } from "./deps.js";

const handleRequest = async (request) => {
  return await serveDir(request, {
      fsRoot: './frontend/dist',
  });
};

serve(handleRequest, { port: 7778 });
