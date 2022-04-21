import {useState, useEffect} from "react";
import algosdk from "algosdk";
import { clientForChain, ChainType } from "./helpers/api";

export default function Account() {
  const [owner, setOwner] = useState({addr:""});
  const [address, setAddress] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const createAccount = () => {
      try {  
          const account = algosdk.generateAccount();
          setAddress(account.addr);
          const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
          setMnemonic(mnemonic);
          return account;
      }
      catch (err) {
          console.log("err", err);
      }
  };

  useEffect(()=>{
    const actAlice = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_ALICE!);
    setOwner(actAlice);
  }, []);

  //const actAlice = createAccount();

  const createAsset = async () => {
    const algodclient = clientForChain(ChainType.TestNet);
    let params = await algodclient.getTransactionParams().do();
    let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored

    let addr = owner!.addr;
    let defaultFrozen = false;
    // integer number of decimals for asset unit calculation
    let decimals = 0;
    // total number of this asset available for circulation   
    let totalIssuance = 1000;
    // Used to display asset units to user    
    let unitName = "piece";
    // Friendly name of the asset    
    let assetName = "cake";
    // Optional string pointing to a URL relating to the asset
    let assetURL = "http://someurl";
    // Optional hash commitment of some sort relating to the asset. 32 character length.
    let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d";
    // The following parameters are the only ones
    // that can be changed, and they have to be changed
    // by the current manager
    // Specified address can change reserve, freeze, clawback, and manager
    let manager = owner!.addr;
    // Specified address is considered the asset reserve
    // (it has no special privileges, this is only informational)
    let reserve = owner!.addr;
    // Specified address can freeze or unfreeze user asset holdings 
    let freeze = owner!.addr;
    // Specified address can revoke user asset holdings and send 
    // them to other addresses    
    let clawback = owner!.addr;

    // signing and sending "txn" allows "addr" to create an asset
    let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
      addr!, 
      note,
      totalIssuance, 
      decimals, 
      defaultFrozen, 
      manager, 
      reserve, 
      freeze,
      clawback, 
      unitName, 
      assetName, 
      assetURL, 
      assetMetadataHash, 
      params);

    let rawSignedTxn = txn.signTxn(owner!.sk)
    let tx = (await algodclient.sendRawTransaction(rawSignedTxn).do());

    let assetID = null;
    // wait for transaction to be confirmed
    const ptx = await algosdk.waitForConfirmation(algodclient, tx.txId, 4);
    // Get the new asset's information from the creator account
    assetID = ptx["asset-index"];
    //Get the completed Transaction
    console.log("Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"]);
  }

  return (
    <div className="flex flex-col justify-center">
      <main className='flex flex-col p-4'>
        <div>owner = {owner?.addr}</div>

        <button className="btn btn-primary m-4" onClick={createAccount}>Create Account</button>
        <input readOnly type="text"  className="input input-bordered input-sm w-full m-4 font-mono" value={address}/>
        <textarea readOnly className="m-4 textarea textarea-primary font-mono" value={mnemonic}></textarea>

        <button className="btn btn-primary m-4" onClick={createAsset}>Create Asset</button>
        


      </main>

    </div>
  )
}
