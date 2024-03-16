import { render, screen } from '@testing-library/react';
import { ToggleSwitch } from '../common/ToggleSwitch';
import '@testing-library/jest-dom';

describe('Test App.tsx', () => {
    test('make sure test set up is working', () => {
        const onchange = (event: React.ChangeEvent<HTMLInputElement>) => {};
        const classnames = {
            container: 'container',
            label: 'label',
            switch: 'switch',
            input: 'input',
        };
        render(
            <ToggleSwitch
                checked={true}
                label={'test'}
                onChange={onchange}
                classNames={classnames}
            />
        );
        const label = screen.getAllByRole('label');
        expect(label).toBeInTheDocument();
    });
});
