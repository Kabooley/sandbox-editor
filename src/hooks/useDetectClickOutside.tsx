import React, { useRef, useEffect, useState } from 'react';

/***
 * https://stackoverflow.com/a/42234988/22007575
 * */
const useDetectClickOutside = <T = Element,>(ref: React.RefObject<T>) => {
    const [isClickedOutside, setIsClickOutside] = useState<boolean>(false);
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: React.MouseEvent<T>) {
            if (ref.current && !ref.current.contains(event.target)) {
                // alert("You clicked outside of me!");
            }
        }
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    return isClickedOutside;
};

export default useDetectClickOutside;
