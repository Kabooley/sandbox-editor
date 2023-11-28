import React from 'react';

type Props = {
    checked: boolean;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    classNames: {
        container: string;
        label: string;
        switch: string;
        input: string;
    };
};

export const ToggleSwitch = (props: Props) => {
    return (
        <label className={props.classNames.container}>
            <span className={props.classNames.label}>{props.label}</span>
            <span
                className={[
                    props.classNames.switch,
                    props.checked ? 'active' : 'inactive',
                ].join()}
            />
            <input
                type="checkbox"
                checked={props.checked}
                onChange={props.onChange}
                className={props.classNames.input}
            />
        </label>
    );
};

// const styles = StyleSheet.create({
//   container: {
//     display: 'flex',
//     alignItems: 'center',
//     margin: 8,
//     cursor: 'pointer',
//     whiteSpace: 'nowrap',
//   },
//   switch: {
//     display: 'inline-block',
//     verticalAlign: -4,
//     width: 36,
//     height: 20,
//     borderRadius: 12,
//     border: `1px solid ${c('border')}`,
//     backgroundColor: c('background'),

//     ':before': {
//       content: '""',
//       display: 'inline-block',
//       height: 14,
//       width: 14,
//       borderRadius: 7,
//       margin: 2,
//       transition: '.2s',
//       transform: 'translateX(0)',
//     },
//   },
//   inactive: {
//     ':before': {
//       transform: 'translateX(0)',
//       backgroundColor: c('soft'),
//     },
//   },
//   active: {
//     ':before': {
//       transform: 'translateX(16px)',
//       backgroundColor: c('primary'),
//     },
//   },
//   check: {
//     display: 'none',
//   },
//   label: {
//     flex: 1,
//     padding: '0 .5em',
//     fontWeight: 'normal',
//   },
// });
