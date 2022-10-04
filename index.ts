import { useSyncExternalStore } from "use-sync-external-store/shim";

export const createState = <T, R>(
  state: T,
  methods: {
    [key in keyof R]: (args: R[key]) => Promise<Partial<T>> | Partial<T>;
  }
) => {
  const listeners = new Set<() => void>();

  const subscribe = (clbk: () => void) => {
    listeners.add(clbk);
    return () => listeners.delete(clbk);
  };

  let newState: T = state;
  let newMethods: any = {};

  Object.keys(methods).forEach((e) => {
    const fun = methods[e as keyof R];

    newMethods[e] = (p: Parameters<typeof fun>) => {
      if (
        typeof fun(p as any as R[keyof R]) === "object" &&
        typeof (fun(p as any as R[keyof R]) as any).then === "function"
      )
        (fun(p as any as R[keyof R]) as any).then((s: Partial<T>) => {
          newState = { ...newState, ...s };
          listeners.forEach((l) => l());
        });
      else {
        newState = { ...newState, ...fun(p as any as R[keyof R]) };
        listeners.forEach((l) => l());
      }
    };
  });

  return {
    useStore: (field: keyof T) =>
      useSyncExternalStore(subscribe, () => newState[field]) as any,
    ...(newMethods as typeof methods),
  };
};

export default createState;
