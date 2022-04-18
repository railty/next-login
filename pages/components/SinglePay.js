import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toNumber } from "../AppState";
import { ChainType, apiGetAccountAssets } from "../helpers/api";
import { signTxnScenario, singlePayTxn } from "../scenarios";
import DialogPending from "./DialogPending";
import DialogApproved from "./DialogApproved";

export const SinglePay = () => {
  const [showPending, setShowPending] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const { state, dispatch } = useContext(AppContext);

  
  const pay = ()=>{
    debugger;

    console.log(process.env.NEXT_PUBLIC_DB_HOST);
    signTxnScenario(state.connector, state.connector.accounts[0], ChainType.TestNet, singlePayTxn, setShowPending, setShowApproved);
  }


  if (state.connector?.connected) return (
    <>
      <button className='btn btn-sm btn-primary' onClick={pay}>Pay</button>
      {showPending && <DialogPending onSubmit={null} onCancel={()=>setShowPending(false)}/>}
      {showApproved && <DialogApproved onSubmit={null} onCancel={()=>setShowApproved(false)}/>}

    </>
  )
  else return (
    <div>Please connect your wallet</div>
  )
};
  