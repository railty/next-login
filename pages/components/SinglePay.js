import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toNumber } from "../AppState";
import { ChainType, apiGetAccountAssets } from "../helpers/api";
import { IResult, signTxnScenario, singlePayTxn, createSinglePayTxn, createSignTxnsRequest, parseResult } from "../scenarios";
import Dialog from "./Dialog";
import TxInfo from "./TxInfo";

export const SinglePay = () => {
  const [dialogPending, setDialogPending] = useState({
    show: false,
    title: "Pending Call Request",
  });
  const [dialogApproved, setDialogApproved] = useState({
    show: false,
    title: "Call Request Approved",
  });
  const [txs, setTxs] = useState(null);

  const { state, dispatch } = useContext(AppContext);

  const pay = async ()=>{
    const txnsToSign = await createSinglePayTxn(ChainType.TestNet, state.connector.accounts[0], process.env.NEXT_PUBLIC_TEST1, 0.1, "note", "message");
    const request = await createSignTxnsRequest(txnsToSign);

    setDialogPending({...dialogPending, show: true});
    let result = null;
    try{
      result = await state.connector.sendCustomRequest(request);
      console.log(result);
      console.log("strResult = ", JSON.stringify(result));

      const rawSignedTxn = Buffer.from(result[0], "base64");
      console.log("rawSignedTxn = ", rawSignedTxn);
    }
    catch(ex){
      console.log("ex = ", ex.toString());
    }
    setDialogPending({...dialogPending, show: false});

    const parsedResult = parseResult(txnsToSign, result);
    console.log("parsedResult=", parsedResult);

    setTxs(parsedResult);

    setDialogApproved({
      ...dialogApproved,
      show: true,
    });

    /*
    const formattedResult: IResult = {
      method: "algo_signTxn",
      body: signedTxnInfo,
    };
    */
  }

  const submit = ()=>{
    console.log("submit");

    //this.setState({ pendingSubmissions: signedTxns.map(() => 0) });
    const chain = ChainType.TestNet;

    txs.forEach(async (signedTxn, index) => {
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
      <button className='btn btn-sm btn-primary' onClick={pay}>Pay</button>

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
          <TxInfo txs={txs}/>
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
  