import { useContext, useState, useEffect } from "react";
import { AppContext, actions, toShortString } from "../AppState";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

export const Login = () => {
  const { state, dispatch } = useContext(AppContext);

  const disconnect = async ()=>{
    console.log("disconnect");
    await state.connector.killSession();
  }

  const connect=()=>{
    console.log("connect");

    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    
    if (!connector.connected) {
      connector.createSession();
    }
    
    connector.on("connect", (error, payload) => {
      if (error) throw error;
   
      const { accounts, chainId } = payload.params[0];
      dispatch({ type: actions.SET_CONNECTOR, connector: connector });
    });
    
    connector.on("session_update", (error, payload) => {
      if (error) throw error;
      const { accounts, chainId } = payload.params[0];
      dispatch({ type: actions.SET_CONNECTOR, connector: connector });
    });
    
    connector.on("disconnect", (error, payload) => {
      if (error) throw error;
      dispatch({ type: actions.SET_CONNECTOR, connector: connector });
    });

    dispatch({ type: actions.SET_CONNECTOR, connector: connector });
  }

  useEffect(()=>{
    connect();
  }, []);


  if (state.connector?.connected) return (
    <div className="flex flex-row items-center">
      <div className="px-2" title={state.account}>{toShortString(state.account)}</div>
      <button className="btn btn-sm btn-primary" onClick={disconnect}>Disconnect</button>
    </div>
  )
  else return (
    <>
      <button className="btn btn-sm btn-primary" onClick={connect}>Connect</button>
    </>
  )
  
};
  