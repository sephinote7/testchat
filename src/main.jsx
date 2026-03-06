import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer';
import PcNav from './components/PcNav.jsx';
import ScrollToTop from './components/ScrollToTop';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <PcNav />
    <App />
    <Footer />
    <Nav />
  </BrowserRouter>,
);
