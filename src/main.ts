import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

/**
 * `public/404.html` returns a deep link as `?p=<path>`; restore it first.
 */
function restoreRoute(): void {
  const wanted = new URLSearchParams(window.location.search).get('p');
  if (!wanted || !wanted.startsWith('/')) return;
  window.history.replaceState({}, '', wanted);
}

restoreRoute();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
