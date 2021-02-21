export type ValueOrSetter<T> = T | ((prev: T) => T);

export function createState<T>(initialValue: T) {
  let state = initialValue;

  const getState: () => T = () => state;
  const setState = (valueOrSetter: ValueOrSetter<T>) => {
    if (isSetterFunction(valueOrSetter)) {
      valueOrSetter(state);
    } else {
      state = valueOrSetter;
    }
  };

  return [getState, setState] as const;
}

function isSetterFunction<T>(valueOrSetter: ValueOrSetter<T>): valueOrSetter is (prev: T) => T {
  return typeof valueOrSetter === "function";
}
