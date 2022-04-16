import { createContext, useReducer, useMemo } from "react";

const initialState = {
  connector: null,
  account: null,
  balance: null,
};
  
export const toNumber = (bn)=>{
	return Number(bn)/1000000;
}

export const toShortString = (str)=>{
  if (str) {
    const n = str.length;
    const l = 4;
    const ss = str.slice(0, l)+"..."+str.slice(n-l, n);
    return ss;
  }
  return null;
}

export const actions = {
  SET_CONNECTOR: "SET_CONNECTOR",
  SET_BALANCE: "SET_BALANCE",
};

  //Reducer to Handle Actions
const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_CONNECTOR:
      return {
        ...state,
        connector: action.connector,
        account: action.connector.accounts[0],
      };

    case actions.SET_BALANCE:
      return {
        ...state,
        balance: action.balance,
      };

    default:
      return state;
  }
};

  //Context and Provider
export const AppContext = createContext();

export const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

