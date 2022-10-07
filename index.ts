import { useSyncExternalStore } from "use-sync-external-store/shim";
import { deepmerge } from "deepmerge-ts";

function createState<T, R>(
  state: T,
  methods: {
    [key in keyof R]: (...args: any) => Partial<T> | Promise<Partial<T>>;
  }
) {
  const listeners = new Set<() => void>();

  const subscribe = (clbk: () => void) => {
    listeners.add(clbk);
    return () => listeners.delete(clbk);
  };

  let newState = state || {};

  let newMethods = methods;

  Object.keys(methods).forEach((e) => {
    const fun = methods[e as keyof R];

    (newMethods[e as keyof R] as any) = (p: Parameters<typeof fun>) => {
      if (
        typeof fun(p) === "object" &&
        typeof (fun(p) as any).then === "function"
      )
        (fun(p) as Promise<Partial<T>>).then((s) => {
          newState = deepmerge(newState, s);
          listeners.forEach((l) => l());
        });
      else {
        newState = deepmerge(newState, fun(p));
        listeners.forEach((l) => l());
      }
    };
  });

  const sUpdate = (e: Partial<typeof methods>) => {
    newState = deepmerge(newState, e);
    listeners.forEach((l) => l());
  };

  return {
    useStore: (field: (string | string | number)[]) =>
      useSyncExternalStore(subscribe, () => {
        if (typeof field !== "string")
          return field.reduce(
            (xs: any, x) => (xs && xs[x] ? xs[x] : null),
            newState
          );
        else return newState[field];
      }),
    sUpdate,
    ...newMethods,
  };
}

export default createState;
