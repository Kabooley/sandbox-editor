// // 
// import React, { useState, useRef, useEffect } from 'react';
// // import { debounce } from 'lodash';

// interface iProps {
//     onChange: (value: string) => void;
//     handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
// } 

// const SearchBox = ({
//     onChange, handleSubmit
// }: iProps) => {
//     const form = useRef<HTMLFormElement>();
//     const [focus, setFocus] = useState(false);

//     useEffect(() => {

//     }, []);

//     return (
//         <form
//           ref={form}
//           onSubmit={handleSubmit}
//         >
//           <input
//             autoFocus
//             onFocus={() => setFocus(true)}
//             onBlur={() => setFocus(false)}
//             placeholder="Add npm dependency"
//             name="requestvalue"
//           />
//         </form>
//       );
// };

// export default SearchBox;