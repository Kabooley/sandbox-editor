// https://stackoverflow.com/a/45576880
// Shallow compare
// https://stackoverflow.com/questions/22266826/how-can-i-do-a-shallow-comparison-of-the-properties-of-two-objects-with-javascri
// prettier-ignore
export const isSameShallowObject = <T extends Record<string, string>>(obj1: T, obj2: T) => {
    return (
      Object.keys(obj1).length === Object.keys(obj2).length &&
      Object.keys(obj1).every((key) => obj1[key] === obj2[key])
    );
  };
