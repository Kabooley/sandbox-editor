import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { store } from './store';
import { Provider } from 'react-redux';
import './sass/main.scss';

ReactDOM.render(
    <React.StrictMode>
        {/* <React.Profiler id={"profiler-App"} onRender={}> */}
        <Provider store={store}>
            <App />
        </Provider>
        {/* </React.Profiler> */}
    </React.StrictMode>,
    document.getElementById('root')
);
