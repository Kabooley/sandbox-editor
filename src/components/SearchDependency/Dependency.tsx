import React from 'react';

interface iProps {
    dependency: string;
};

const Dependency = ({ dependency }: iProps) => {
    return (
        <div>
            <li>{dependency}</li>
        </div>
    )
};

export default Dependency;