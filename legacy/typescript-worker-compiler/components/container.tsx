import React, { useState } from 'react';
import { Editor } from './Editor';
import DisplayErrors from './DisplayErrors';

const Container = () => {
    const [transpiled, setTranspiled] = useState<string>("");

    const onTranspile = (transpiledJs: string) => {
        setTranspiled(transpiledJs);
    }

    return (
        <div className="container">
            <Editor onTranspile={onTranspile} />
            <DisplayErrors runnableJs={transpiled} />
        </div>
    )
};

export default Container;