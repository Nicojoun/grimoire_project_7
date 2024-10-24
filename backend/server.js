const http = require('http');

const server = http.createServer((req, res) => {
    res.end('Je mange des tartes aux pommes !');
});

server.listen(process.env.PORT || 3000);