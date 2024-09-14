import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';
import 'jest-canvas-mock';

configure({ testIdAttribute: 'data-my-test-id' });

// ここでglobal.Worker = Worker_みたいにしてもglobalってなにっていわれる
