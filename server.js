/**
 * CodeAlpha DevOps - Tâche 4 : Web Server using Docker
 * Petit serveur web Express avec endpoints de démonstration,
 * health-check et métriques basiques pour illustrer le cycle de vie
 * d'un conteneur Docker (start, healthcheck, logs, stop).
 */

const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

app.use(express.json());

// Petit middleware de logs (visible avec `docker logs`)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Page d'accueil
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur le serveur web CodeAlpha DevOps (Tâche 4 - Docker)',
    hostname: os.hostname(),
    uptime_seconds: Math.floor((Date.now() - START_TIME) / 1000),
  });
});

// Health check — utilisé par Docker HEALTHCHECK et par les orchestrateurs
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Endpoint d'info système — utile pour vérifier l'isolation du conteneur
app.get('/api/info', (req, res) => {
  res.json({
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
    freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
    nodeVersion: process.version,
  });
});

// Endpoint qui simule une charge / erreur pour tester le troubleshooting
app.get('/api/echo/:msg', (req, res) => {
  res.json({ youSent: req.params.msg, receivedAt: new Date().toISOString() });
});

// Gestion 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT} (pid ${process.pid})`);
});

module.exports = app;
