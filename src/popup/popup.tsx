import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import './popup.css';

const el = document.getElementById('root');
if (!el) throw new Error('Root element not found');
const root = ReactDOM.createRoot(el);
root.render(<App />);
