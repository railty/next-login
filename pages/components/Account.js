import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toNumber } from "../AppState";
import { ChainType, apiGetAccountAssets } from "../helpers/api";

export const Account = () => {
  const { state, dispatch } = useContext(AppContext);

  useEffect(()=>{
    async function getInfo(){
      if (state.account){

        const assets = await apiGetAccountAssets(ChainType.TestNet, state.account);
        
        dispatch({ type: actions.SET_BALANCE, balance: assets[0].amount });
      }
    }

    getInfo();
  }, [state.account]);

  const test = async ()=>{
  }

  if (state.connector?.connected) return (
    <div>Balance: {toNumber(state.balance)}</div>
  )
  else return (
    <div>Please connect your wallet</div>
  )
  
};
  