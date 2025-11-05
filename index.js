// MERCY

const fastify = require("fastify");

const server = fastify();

server.post("/stream/*", async (req, res) => {
  const site = req.params['*'];
  console.log(site)
  if (!site.includes(".")){
    res.send(JSON.stringify({
        "error": "Invalid domain."
    }))
    return
  }
  else{
    try {
      const response = await fetch("https://" + site, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.text();
      res.type(response.headers.get('content-type') || 'text/plain');
      res.send(data);
    } catch (error) {
      console.error(error);
      res.send(JSON.stringify({
        "error": "Failed to fetch data."
      }));
    }
  }
});

server.get("/default/*", async (req, res) => {
  const site = req.params['*'];
  if (!site.includes(".")){
    res.send(JSON.stringify({
        "error": "Invalid domain."
    }))
    return
  }
  else{
    try {
      const response = await fetch("https://" + site, {
        headers: req.headers,
        body: req.body
      });
      const data = await response.text();
      res.type('text/html')
      res.send(data);
    } catch (error) {
      console.error(error);
      res.send(JSON.stringify({
        "error": "Failed to fetch data."
      }));
    }
  }
});

server
  .listen({ port: 8080, host: "0.0.0.0" })
  .then((address) => {
    console.log(`Server listening at ${address}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
