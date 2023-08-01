// 
import React, { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

interface iProps {
    onChange: (value: string) => void;
    handleManualSelect: () => void;
} 

const SearchBox = ({
    onChange, handleManualSelect
}: iProps) => {
    const form = useRef<HTMLFormElement>();
    const [focus, setFocus] = useState(false);

    useEffect(() => {

    }, []);

    const hanldeChange = (value: string) => {

    }

    const debouncedChange = useCallback(debounce(hanldeChange, 500), []);

    return (
        <form
          ref={form}
          onSubmit={() => handleManualSelect(workspace.dependencySearch)}
        >
          {/* <Element
            paddingLeft={4}
            css={css({
              position: 'relative',
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: 'sideBar.border',
    
              '&:before': {
                left: 4,
                width: 32,
                height: '100%',
                content: '""',
                position: 'absolute',
                top: 0,
                backgroundImage: theme => getBackgroundColor({ focus, theme }),
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                opacity: focus ? 1 : 0.8,
              },
            })}
          > */}
          <div>
            <input
              autoFocus
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder="Add npm dependency"
            //   css={css({
            //     paddingRight: 140,
            //     paddingLeft: 10,
            //     height: 65,
            //     fontSize: 4,
            //     color: 'input.foreground',
            //     backgroundColor: 'sideBar.background',
            //     border: 'none',
            //     ':focus, :hover': {
            //       border: 'none',
            //     },
            //     '::-webkit-input-placeholder': {
            //       fontSize: 4,
            //     },
            //     '::-moz-placeholder': {
            //       fontSize: 4,
            //     },
            //     ':-ms-input-placeholder': {
            //       fontSize: 4,
            //     },
            //     ':-moz-placeholder': {
            //       fontSize: 4,
            //     },
            //   })}
              onChange={e => debouncedChange(e.target.value)}
              // defaultValue={workspace.dependencySearch}
            />
            {/* <AlgoliaIcon
              css={css({
                top: 4,
                right: 4,
                position: 'absolute',
              })}
            /> */}
            </div>
          {/* </Element> */}
        </form>
      );
};

export default SearchBox;