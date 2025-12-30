
require('dotenv').config({ path: '.env.production' });
const { createServer } = require("http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

const PORT = 3020;

app.prepare().then(() => {
  createServer((req, res) => handle(req, res))
    .listen(PORT, "127.0.0.1", () => {
      console.log(`> Ready on http://127.0.0.1:${PORT}`);
    });
});
