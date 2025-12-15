const { createServer } = require("http");
const next = require("next");

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3020;

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, "0.0.0.0", (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`> Main site ready on http://0.0.0.0:${port}`);
  });
});
