import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';

configure({ testIdAttribute: 'data-my-test-id' });