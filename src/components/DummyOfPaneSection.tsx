import React, { useState } from 'react';
import SectionTitle from './Explorer/SectionTitle';

interface iProps {
    title: string;
}

const DummyOfPaneSection = ({ title }: iProps) => {
    const [collapse, setCollapse] = useState<boolean>(true);
    return (
        <section className="pane-sction">
            <SectionTitle
                title={title}
                collapse={collapse}
                setCollapse={setCollapse}
                treeItemFunctions={[]}
            />
            <div className={collapse ? 'collapsible collapse' : 'collapsible'}>
                {/* Set items that is belongs to this section */}
                <div
                    style={{ height: '400px', backgroundColor: 'purple' }}
                >{`${title} contents `}</div>
            </div>
        </section>
    );
};

export default DummyOfPaneSection;
