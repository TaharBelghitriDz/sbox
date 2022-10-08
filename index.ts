import { useSyncExternalStore } from "use-sync-external-store/shim";
import { deepmerge } from "deepmerge-ts";

function createState<T, R>(
  state: T,
  methods: (currentState: T) => {
    [key in keyof R]: (...args: any) => Partial<T> | Promise<Partial<T>>;
  }
) {
  const listeners = new Set<() => void>();

  const subscribe = (clbk: () => void) => {
    listeners.add(clbk);
    return () => listeners.delete(clbk);
  };

  let newState = state;

  let newMethods = methods(newState);

  Object.keys(methods(newState)).forEach((e) => {
    const fun = methods(newState)[e as keyof R];

    newMethods[e as keyof R] = (p: Parameters<typeof fun>) => {
      if (
        typeof fun(p) === "object" &&
        typeof (fun(p) as any).then === "function"
      )
        return (fun(p) as Promise<Partial<T>>).then((s: Partial<T>) => {
          newState = deepmerge(newState, s) as any as T;
          listeners.forEach((l) => l());
          return newState;
        });
      else
        return (
          (newState = deepmerge(newState, fun(p)) as any as T),
          listeners.forEach((l) => l()),
          newState
        );
    };
  });

  const sUpdate = (e: Partial<typeof methods>) => {
    newState = deepmerge(newState, e) as any as T;
    listeners.forEach((l) => l());
  };

  return {
    useStore: (field: (s: typeof state) => any) =>
      useSyncExternalStore(subscribe, () => field(newState)),
    sUpdate,
    ...newMethods,
  };
}

export default createState;
