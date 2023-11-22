const http = require('http');
const jwt = require('jsonwebtoken');

const secretKey = 'youWouldntGuessIt';

const server = http.createServer((req, res) => {
  // if you run the client from sth like file:///C:/nodejs/10httonlyCookie1/index.html
  // it would mean HTML file is being served via the file:// protocol directly from your filesystem rather than over HTTP or HTTPS.
  console.log('Request origin:', req.headers.origin);
  res.setHeader('Access-Control-Allow-Origin', 'https://hacketon2front.onrender.com'); // Adjust the port if necessary
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    // Preflight request automatically sends by the browser for many reasons
    res.writeHead(204); // success with no content to return to the client
    res.end();
    return;
  }

  /* /login */
  if (req.url === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });

    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body); // Parse the JSON body
        if (username === 'admin' && password === '1@2#3') {
          const token = jwt.sign({ username }, secretKey, { expiresIn: '1m' });
          console.log('Token:', token);
          res.writeHead(200, {
            'Set-Cookie': `token=${token}; HttpOnly; Max-Age=60; SameSite=None; Secure`,
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ message: 'Logged in successfully' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Bad Request: Invalid JSON' }));
      }
    });
  } else if (req.url === '/something' && req.method === 'GET') {
    // Check if the user is logged in by checking the cookie
    const cookie = req.headers.cookie;
    if (cookie) {
      const tokenMatch = cookie.match(/token=([^;]*)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        try {
          const payload = jwt.verify(token, secretKey);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'You are logged in, treasure:GOLD.' }));
          return;
        } catch (e) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Unauthorized: Invalid token.' }));
          return;
        }
      }
    }
    // No token found in the cookie or token verification failed
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unauthorized: You are not logged in.' }));
  } else {
    // For any other route, return 404 not found
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
