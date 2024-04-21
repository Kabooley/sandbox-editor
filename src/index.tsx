import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './sass/main.scss';

ReactDOM.render(
    <React.StrictMode>
        {/* <React.Profiler id={"profiler-App"} onRender={}> */}
        <App />
        {/* </React.Profiler> */}
    </React.StrictMode>,
    document.getElementById('root')
);
