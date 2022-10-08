# sbox

the easiest and simple solution for react scalable state management

## Installation

```bash
npm install sbox-react
```

### first create store

all what you need is on the createState function

```javascript
const state = { s: "hi", r: { j: "j", m: "m" } };

const store = createState(state, (currentState) => ({
  // all what you need is return a partial from the state to update it
  // it's gonna mege the state and this object so you don't have to worry about anything

  open: () => ({ s: "s - " + Date.now() }),
  close: async (e) => {
    const fetch = await ...
    //some workd here

    return { s: { j : fetch} };
  },
}));
```

#### and use it on your components

```javascript
function Value = () => {
    // state is you current state with latest update
  const value = store.useStore((state) => state.s);
  return <h1>{value} around here ...</h1>;
}
```

### how to use methods

```javascript
function Value = () => {
  const value = store.useStore((state) => state.s);


  return <h1 onClick={()=> store.open()} >
            click me to update it ... {value}
        </h1>;
}
```

### sUpdate

easy function to helping with updtae state, get an object as parameter and merge it with the state

```javascript
function Value = () => {
    // state is you current state with latest update
  const value = store.useStore((state) => state.s);
  return <h1>{value} around here ...</h1>;
}
```

### Why sbox over all ?

- Simple and un-opinionated
- Makes hooks the primary means of consuming state
- Doesn't wrap your app in context providers
- Can inform components transiently (without causing render)
- i made it :)
