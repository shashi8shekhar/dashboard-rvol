export const path = (pathArr, object) => {
  for (let prop of pathArr) {
    if (!object?.[prop]) {
      return object?.[prop] ?? undefined;
    } else {
      object = object?.[prop];
    }
  }
  return object;
};

export const pathOr = (defaultValue, pathArr, object) => {
  for (let prop of pathArr) {
    if (!object?.[prop]) {
      return object?.[prop] ?? defaultValue;
    } else {
      object = object?.[prop];
    }
  }
  return object;
};

export const isEmpty = obj => {
  return !Object.keys(obj).length;
};
