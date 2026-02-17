import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('SMIRT: Avvio applicazione...');

const container = document.getElementById('root');

if (!container) {
  console.error('Errore critico: Elemento #root non trovato nel DOM.');
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('SMIRT: React mount completato.');
}