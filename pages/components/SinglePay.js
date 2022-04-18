import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toNumber } from "../AppState";
import { ChainType, apiGetAccountAssets } from "../helpers/api";
import { signTxnScenario, singlePayTxn } from "../scenarios";

export const SinglePay = () => {
  const { state, dispatch } = useContext(AppContext);

  const pay = ()=>{
    signTxnScenario(state.connector, state.address, state.chainType, singlePayTxn);
  }


  if (state.connector?.connected) return (
    <button className='btn btn-sm btn-primary' onClick={pay}>Pay</button>
  )
  else return (
    <div>Please connect your wallet</div>
  )
  
};
  