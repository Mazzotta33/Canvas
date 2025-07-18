import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './part2/App.tsx';
import './index.css';

const rootElement = document.getElementById('app');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Не удалось найти корневой элемент с id 'app'");
}