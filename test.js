/**
 * Test simple (sans dépendance supplémentaire) qui démarre le serveur
 * et vérifie que les endpoints principaux répondent correctement.
 */
const http = require('http');

const app = require('./server');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    }).on('error', reject);
  });
}

async function runTests() {
  let failures = 0;

  const checks = [
    { path: '/', expectStatus: 200, label: 'Page d\'accueil' },
    { path: '/health', expectStatus: 200, label: 'Health check' },
    { path: '/api/info', expectStatus: 200, label: 'Info système' },
    { path: '/api/echo/bonjour', expectStatus: 200, label: 'Echo endpoint' },
    { path: '/route-inexistante', expectStatus: 404, label: '404 sur route inconnue' },
  ];

  for (const check of checks) {
    try {
      const res = await get(check.path);
      if (res.status === check.expectStatus) {
        console.log(`✅ ${check.label} (${check.path}) -> ${res.status}`);
      } else {
        console.error(`❌ ${check.label} (${check.path}) -> attendu ${check.expectStatus}, reçu ${res.status}`);
        failures++;
      }
    } catch (err) {
      console.error(`❌ ${check.label} (${check.path}) -> erreur: ${err.message}`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) échoué(s).`);
    process.exit(1);
  } else {
    console.log('\nTous les tests sont passés. ✅');
    process.exit(0);
  }
}

// Laisser le serveur démarrer avant de lancer les tests
setTimeout(runTests, 300);
