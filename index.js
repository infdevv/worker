// HTTP/HTTPS Proxy Server

const http = require('http');
const https = require('https');
const net = require('net');
const { URL } = require('url');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer((req, res) => {
  // Handle regular HTTP requests (non-CONNECT)
  if (req.method !== 'CONNECT') {
    handleHttpRequest(req, res);
  } else {
    // This shouldn't happen here, but handle it gracefully
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

// Handle CONNECT method for HTTPS tunneling
server.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = parseHostPort(req.url);

  console.log(`CONNECT ${hostname}:${port}`);

  const serverSocket = net.connect(port, hostname, () => {
    clientSocket.write(
      'HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: Node.js-Proxy\r\n' +
      '\r\n'
    );
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    console.error(`Error connecting to ${hostname}:${port}`, err.message);
    clientSocket.end();
  });

  clientSocket.on('error', (err) => {
    console.error('Client socket error:', err.message);
    serverSocket.end();
  });
});

function handleHttpRequest(req, res) {
  try {
    const url = new URL(req.url);

    console.log(`${req.method} ${url.href}`);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: req.method,
      headers: { ...req.headers }
    };

    // Remove proxy-specific headers
    delete options.headers['proxy-connection'];
    delete options.headers['proxy-authorization'];

    // Ensure host header is correct
    options.headers.host = url.host;

    const protocol = url.protocol === 'https:' ? https : http;

    const proxyReq = protocol.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err.message);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq);

  } catch (err) {
    console.error('Error handling request:', err.message);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
  }
}

function parseHostPort(hostString) {
  const [hostname, portStr] = hostString.split(':');
  const port = portStr ? parseInt(portStr, 10) : 443;
  return { hostname, port };
}

server.listen(PORT, HOST, () => {
  console.log(`Proxy server listening at http://${HOST}:${PORT}`);
});
