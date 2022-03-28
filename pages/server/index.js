const http = require('http');
const app = require('./server');

const server = http.createServer(app);
const oracleServerPort = 8000;
let currentApp = app;
server.listen(oracleServerPort, () =>
  console.log('Server is up on port ' + oracleServerPort)
);

if (module.hot) {
  module.hot.accept('./server', () => {
    server.removeListener('request', currentApp);
    server.on('request', app);
    currentApp = app;
  });
}
