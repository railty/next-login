import algosdk from "algosdk";
import WalletConnect from "@walletconnect/client";
import { apiGetTxnParams, ChainType } from "./api";
import { IWalletTransaction, SignTxnParams } from "./types";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import { ScenarioReturnType } from "../scenarios";

export interface IResult {
  method: string;
  body: Array<
    Array<{
      txID: string;
      signingAddress?: string;
      signature: string;
    } | null>
  >;
}

export const createSinglePayTxns = async (
  chain: ChainType,
  fromAddress: string,
  toAddress: string,
  amount: number,
  note: string,
  message: string
): Promise<ScenarioReturnType> => {

  const suggestedParams = await apiGetTxnParams(chain);
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAddress,
    to: toAddress,
    amount: amount*1000*1000,
    note: new Uint8Array(Buffer.from(note)),
    suggestedParams,
  });

  const txnsToSign = [
    {
      txn,
      message: message,
    },
  ];
  return [txnsToSign];
};

export const createSinglePayWithCloseTxns = async (
  chain: ChainType,
  fromAddress: string,
  toAddress: string,
  closeAddress: string,
  amount: number,
  note: string,
  message: string
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAddress,
    to: toAddress,
    amount: amount,
    note: new Uint8Array(Buffer.from(note)),
    closeRemainderTo: closeAddress,
    suggestedParams,
  });

  const txnsToSign = [
    {
      txn,
      message: message,
    },
  ];
  return [txnsToSign];
};
  
export const createSignTxnsRequest = async (txnsToSign: ScenarioReturnType) => {
    const flatTxns = txnsToSign.reduce((acc, val) => acc.concat(val), []);

    const walletTxns: IWalletTransaction[] = flatTxns.map(
      ({ txn, signers, authAddr, message }) => ({
        txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64"),
        signers, // TODO: put auth addr in signers array
        authAddr,
        message,
      }),
    );

    // sign transaction
    
    const requestParams: SignTxnParams = [walletTxns];
    const request = formatJsonRpcRequest("algo_signTxn", requestParams);
    return request;
  };

  export const getConfirmedTxs = (txnsToSign: ScenarioReturnType, result: ScenarioReturnType) => {
    const signedPartialTxns: Array<Array<Uint8Array | null>> = txnsToSign.map(() => []);

    const indexToGroup = (index: number) => {
      for (let group = 0; group < txnsToSign.length; group++) {
        const groupLength = txnsToSign[group].length;
        if (index < groupLength) {
          return [group, index];
        }

        index -= groupLength;
      }

      throw new Error(`Index too large for groups: ${index}`);
    };

    result.forEach((r, i) => {
      const [group, groupIndex] = indexToGroup(i);
      const toSign = txnsToSign[group][groupIndex];

      if (r == null) {
        if (toSign.signers !== undefined && toSign.signers?.length < 1) {
          signedPartialTxns[group].push(null);
          return;
        }
        throw new Error(`Transaction at index ${i}: was not signed when it should have been`);
      }

      if (toSign.signers !== undefined && toSign.signers?.length < 1) {
        throw new Error(`Transaction at index ${i} was signed when it should not have been`);
      }

      const rawSignedTxn = Buffer.from(r, "base64");
      signedPartialTxns[group].push(new Uint8Array(rawSignedTxn));
    });
    return signedPartialTxns;
  }

  export const getSignedTxns = (signedPartialTxns: Array<Array<Uint8Array | null>>) => {
    const signedTxns: Uint8Array[][] = signedPartialTxns.map(
      (signedPartialTxnsInternal, group) => {
        return signedPartialTxnsInternal.map((stxn, groupIndex) => {
          if (stxn) {
            return stxn;
          }

          return signTxnWithTestAccount(txnsToSign[group][groupIndex].txn);
        });
      },
    );
    return signedTxns;
  }

  export const getSignedTxnInfo = (signedPartialTxns: Array<Array<Uint8Array | null>>, txnsToSign: Uint8Array[][]) => {
    const signedTxnInfo: Array<Array<{
      txID: string;
      signingAddress?: string;
      signature: string;
    } | null>> = signedPartialTxns.map((signedPartialTxnsInternal, group) => {
      return signedPartialTxnsInternal.map((rawSignedTxn, i) => {
        if (rawSignedTxn == null) {
          return null;
        }

        const signedTxn = algosdk.decodeSignedTransaction(rawSignedTxn);
        const txn = (signedTxn.txn as unknown) as algosdk.Transaction;
        const txID = txn.txID();
        const unsignedTxID = txnsToSign[group][i].txn.txID();

        if (txID !== unsignedTxID) {
          throw new Error(
            `Signed transaction at index ${i} differs from unsigned transaction. Got ${txID}, expected ${unsignedTxID}`,
          );
        }

        if (!signedTxn.sig) {
          throw new Error(`Signature not present on transaction at index ${i}`);
        }

        return {
          txID,
          signingAddress: signedTxn.sgnr ? algosdk.encodeAddress(signedTxn.sgnr) : undefined,
          signature: Buffer.from(signedTxn.sig).toString("base64"),
        };
      });
    });

    console.log("Signed txn info:", signedTxnInfo);
  
    // format displayed result
    const formattedResult: IResult = {
      method: "algo_signTxn",
      body: signedTxnInfo,
    };

    return formattedResult;
  }  

  