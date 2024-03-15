import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';

// const { configure } = require('@testing-library/react');
// require('@testing-library/jest-dom');
// require('@testing-library/user-event');

configure({ testIdAttribute: 'data-my-test-id' });
