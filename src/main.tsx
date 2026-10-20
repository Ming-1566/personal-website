import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app/App';
import { PortfolioProvider } from './state/PortfolioProvider';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><PortfolioProvider><App /></PortfolioProvider></BrowserRouter></StrictMode>,
);
