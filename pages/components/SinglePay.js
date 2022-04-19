import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toNumber } from "../AppState";
import { ChainType, apiGetAccountAssets } from "../helpers/api";
import { signTxnScenario, singlePayTxn, createSinglePayTxn, createSignTxnsRequest, parseResult } from "../scenarios";
import DialogPending from "./DialogPending";
import DialogApproved from "./DialogApproved";

export const SinglePay = () => {
  const [showPending, setShowPending] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const { state, dispatch } = useContext(AppContext);

  const pay = async ()=>{
    const txnsToSign = await createSinglePayTxn(ChainType.TestNet, state.connector.accounts[0], process.env.NEXT_PUBLIC_TEST1, 0.1, "note", "message");
    const request = await createSignTxnsRequest(txnsToSign);

    setShowPending(true);
    let result = null;
    try{
      result = await state.connector.sendCustomRequest(request);
      console.log(result);
      const rawSignedTxn = Buffer.from(result[0], "base64");
      console.log(rawSignedTxn);
    }
    catch(ex){
      console.log(ex.toString());
    }
    setShowPending(false);

    const parsetResult = parseResult(txnsToSign, result);
    console.log(parsetResult);

    const formattedResult: IResult = {
      method: "algo_signTxn",
      body: signedTxnInfo,
    };

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
  