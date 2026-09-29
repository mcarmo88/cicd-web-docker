// API mínima, sem dependências externas (só o módulo http do Node).
// Serve uma "frase do dia" sobre DevOps/CI-CD, para a página web consumir.
const http = require('http');

const quotes = [
  "Se dói, faz mais vezes e mais cedo.",
  "Automatiza tudo o que repetires três vezes.",
  "Um pipeline verde não significa código perfeito, significa feedback rápido.",
  "Containers resolvem o 'na minha máquina funciona', não resolvem más decisões.",
  "Falhar em 2 minutos no CI é barato. Falhar em produção não é."
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/api/quote') {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ quote, servedBy: process.env.HOSTNAME || 'api' }));
  } else if (req.url === '/api/health') {
    res.end('ok');
  } else {
    res.statusCode = 404;
    res.end('not found');
  }
});

server.listen(3000, () => console.log('API a correr na porta 3000'));
