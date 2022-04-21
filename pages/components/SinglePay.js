import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toNumber } from "../AppState";
import { ChainType, apiGetAccountAssets, apiSubmitTransactions } from "../helpers/api";
import { createSignTxnsRequest, createSinglePayTxns, getConfirmedTxs, getSignedTxns, getSignedTxnInfo } from "../helpers/transaction";
import { IResult, signTxnScenario, singlePayTxn } from "../scenarios";
import Dialog from "./Dialog";
import TxnInfo from "./TxnInfo";
import algosdk from "algosdk";

export const SinglePay = () => {
  const [dialogPending, setDialogPending] = useState({
    show: false,
    title: "Pending Call Request",
  });
  const [dialogApproved, setDialogApproved] = useState({
    show: false,
    title: "Call Request Approved",
  });
  const [signedTxns, setSignedTxns] = useState(null);
  const [signedTxnInfo, setSignedTxnInfo] = useState(null);

  const { state, dispatch } = useContext(AppContext);

  const pay = async ()=>{
    const actAlice = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_ALICE);

    const txns = await createSinglePayTxns(ChainType.TestNet, state.connector.accounts[0], actAlice.addr, 1, "note", "message");
    const request = await createSignTxnsRequest(txns);

    setDialogPending({...dialogPending, show: true});
    let result = null;
    try{
      result = await state.connector.sendCustomRequest(request);
    }
    catch(ex){
      console.log("ex = ", ex.toString());
    }
    setDialogPending({...dialogPending, show: false});

    const confirmedTxns = getConfirmedTxs(txns, result);

    const signedTxns = getSignedTxns(confirmedTxns);

    const signedTxnInfo = getSignedTxnInfo(confirmedTxns, txns);

    setSignedTxns(signedTxns);
    setSignedTxnInfo(signedTxnInfo);

    setDialogApproved({
      ...dialogApproved,
      show: true,
    });
  }

  const submit = ()=>{
    console.log("submit");

    //this.setState({ pendingSubmissions: signedTxns.map(() => 0) });
    const chain = ChainType.TestNet;

    signedTxns.forEach(async (signedTxn, index) => {
      try {
        const confirmedRound = await apiSubmitTransactions(chain, signedTxn);
/*
        this.setState(prevState => {
          return {
            pendingSubmissions: prevState.pendingSubmissions.map((v, i) => {
              if (index === i) {
                return confirmedRound;
              }
              return v;
            }),
          };
        });
*/
        console.log(`Transaction confirmed at round ${confirmedRound}`);
      } catch (err) {
/*        
        this.setState(prevState => {
          return {
            pendingSubmissions: prevState.pendingSubmissions.map((v, i) => {
              if (index === i) {
                return err;
              }
              return v;
            }),
          };
        });
*/
        console.error(`Error submitting transaction at index ${index}:`, err);
      }
    });

  }

  if (state.connector?.connected) return (
    <>
      <button className='btn btn-sm btn-primary m-4' onClick={pay}>Single Pay</button>

      <Dialog state={[dialogPending, setDialogPending]} >
        <div className="flex justify-center p-4 ">
          <button className="btn btn-circle btn-accent loading"></button>
        </div>

        <div className="flex justify-center p-4">
          <div className="font-bold">Approve or reject request using your wallet</div>
        </div>
      </Dialog>

      <Dialog state={[dialogApproved, setDialogApproved]} >
        <div className="flex justify-center p-4 overflow-x-auto">
          <TxnInfo txns={signedTxnInfo}/>
        </div>

        <div className="flex justify-center p-4">
          <button className="btn btn-primary" onClick={submit}>Submit to network</button>
        </div>
      </Dialog>

    </>
  )
  else return (
    <div>Please connect your wallet</div>
  )
};
  