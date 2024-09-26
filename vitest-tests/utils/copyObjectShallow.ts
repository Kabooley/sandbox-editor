export const shallowCopyObject = <T extends {}>(o: T) => {
  return Object.assign({} as T, o);
};
