const { createServer } = require("http");
const next = require("next");

const port = 3010;
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`>>> Next.js app running on port ${port}`);
  });
});
