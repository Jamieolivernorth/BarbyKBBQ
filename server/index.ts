import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static assets from dist/public
app.use(express.static(path.join(__dirname, 'public')));

// Support client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[PRODUCTION] Server started in production environment`);
  console.log(`[express] serving on port ${PORT}`);
});