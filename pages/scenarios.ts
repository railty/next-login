import algosdk from "algosdk";
import WalletConnect from "@walletconnect/client";
import { apiGetTxnParams, ChainType } from "./helpers/api";
import { IWalletTransaction, SignTxnParams } from "./helpers/types";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

interface IResult {
  method: string;
  body: Array<
    Array<{
      txID: string;
      signingAddress?: string;
      signature: string;
    } | null>
  >;
}

const testAccounts = [
  algosdk.mnemonicToSecretKey(
    "cannon scatter chest item way pulp seminar diesel width tooth enforce fire rug mushroom tube sustain glide apple radar chronic ask plastic brown ability badge",
  ),
  algosdk.mnemonicToSecretKey(
    "person congress dragon morning road sweet horror famous bomb engine eager silent home slam civil type melt field dry daring wheel monitor custom above term",
  ),
  algosdk.mnemonicToSecretKey(
    "faint protect home drink journey humble tube clinic game rough conduct sell violin discover limit lottery anger baby leaf mountain peasant rude scene abstract casual",
  ),
];

export function signTxnWithTestAccount(txn: algosdk.Transaction): Uint8Array {
  const sender = algosdk.encodeAddress(txn.from.publicKey);

  for (const testAccount of testAccounts) {
    if (testAccount.addr === sender) {
      return txn.signTxn(testAccount.sk);
    }
  }

  throw new Error(`Cannot sign transaction from unknown test account: ${sender}`);
}

export interface IScenarioTxn {
  txn: algosdk.Transaction;
  signers?: string[];
  authAddr?: string;
  message?: string;
}

export type ScenarioReturnType = IScenarioTxn[][];

export type Scenario = (chain: ChainType, address: string) => Promise<ScenarioReturnType>;

function getAssetIndex(chain: ChainType): number {
  if (chain === ChainType.MainNet) {
    // MainNet USDC
    return 31566704;
  }

  if (chain === ChainType.TestNet) {
    // TestNet USDC
    return 10458941;
  }

  throw new Error(`Asset not defined for chain ${chain}`);
}

function getAssetReserve(chain: ChainType): string {
  if (chain === ChainType.MainNet) {
    return "2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM";
  }

  if (chain === ChainType.TestNet) {
    return "UJBZPEMXLD6KZOLUBUDSZ3DXECXYDADZZLBH6O7CMYXHE2PLTCW44VK5T4";
  }

  throw new Error(`Asset reserve not defined for chain ${chain}`);
}

function getAppIndex(chain: ChainType): number {
  if (chain === ChainType.MainNet) {
    return 305162725;
  }

  if (chain === ChainType.TestNet) {
    return 22314999;
  }

  throw new Error(`App not defined for chain ${chain}`);
}

export const singlePayTxn: Scenario = async (
  chain: ChainType,
  fromAddress: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAddress,
    to: process.env.NEXT_PUBLIC_TEST1!,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [
    {
      txn,
      message: "This is a payment transaction that sends 0.1 Algos to yourself.",
    },
  ];
  return [txnsToSign];
};

export const createSinglePayTxn = async (
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

const singleAssetOptInTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain);

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [
    {
      txn,
      message: "This transaction opts you into the USDC asset if you have not already opted in.",
    },
  ];
  return [txnsToSign];
};

const singleAssetTransferTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain);

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This transaction will send 1 USDC to yourself." }];
  return [txnsToSign];
};

const singleAssetCloseTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain);

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: getAssetReserve(chain),
    amount: 0,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [
    {
      txn,
      message:
        "This transaction will opt you out of the USDC asset. DO NOT submit this to MainNet if you have more than 0 USDC.",
    },
  ];
  return [txnsToSign];
};

const singleAppOptIn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = getAppIndex(chain);

  const txn = algosdk.makeApplicationOptInTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This transaction will opt you into a test app." }];
  return [txnsToSign];
};

const singleAppCall: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = getAppIndex(chain);

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This transaction will invoke an app call on a test app." }];
  return [txnsToSign];
};

const singleAppCloseOut: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = getAppIndex(chain);

  const txn = algosdk.makeApplicationCloseOutTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This transaction will opt you out of the test app." }];
  return [txnsToSign];
};

const singleAppClearState: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = getAppIndex(chain);

  const txn = algosdk.makeApplicationClearStateTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [
    { txn, message: "This transaction will forcibly opt you out of the test app." },
  ];
  return [txnsToSign];
};

export const scenarios: Array<{ name: string; scenario: Scenario }> = [
  {
    name: "1. Sign pay txn",
    scenario: singlePayTxn,
  },
  {
    name: "2. Sign asset opt-in txn",
    scenario: singleAssetOptInTxn,
  },
  {
    name: "3. Sign asset transfer txn",
    scenario: singleAssetTransferTxn,
  },
  {
    name: "4. Sign asset close out txn",
    scenario: singleAssetCloseTxn,
  },
  {
    name: "5. Sign app opt-in txn",
    scenario: singleAppOptIn,
  },
  {
    name: "6. Sign app call txn",
    scenario: singleAppCall,
  },
  {
    name: "7. Sign app close out txn",
    scenario: singleAppCloseOut,
  },
  {
    name: "8. Sign app clear state txn",
    scenario: singleAppClearState,
  },
];

export const signTxnScenario2 = async (connector: WalletConnect, address: string, chain: ChainType, scenario: Scenario, setShowPending: (x:boolean)=>void, setShowApproved: (x:boolean)=>void) => {
  /*
    const connector: WalletConnect = state.connector;
    const address: string = state.address;
    const chain: ChainType = state.chain;
  
    const { connector: WalletConnect, address: string, chain: ChainType } = ...state;
  */
  
    if (!connector) return;
  
    try {
      debugger;
      const txnsToSign = await scenario(chain, address);
  
  
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

      setShowPending(true);
      const result: Array<string | null> = await connector.sendCustomRequest(request);
      console.log("Raw response:", result);
  
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
  
      const signedPartialTxns: Array<Array<Uint8Array | null>> = txnsToSign.map(() => []);
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
  
      // display result
      this.setState({
        connector,
        pendingRequest: false,
        signedTxns,
        result: formattedResult,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  export const signTxnScenario = async (connector: WalletConnect, txnsToSign: ScenarioReturnType, setShowPending: (x:boolean)=>void, setShowApproved: (x:boolean)=>void) => {
    if (!connector) return;
  
    try {

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

      setShowPending(true);
      const result: Array<string | null> = await connector.sendCustomRequest(request);
      setShowPending(false);
      console.log("Raw response2:", result);
  
      debugger;

      setShowApproved(true);
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
  
      const signedPartialTxns: Array<Array<Uint8Array | null>> = txnsToSign.map(() => []);
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
  
      // display result
      setShowApproved(true);
    } catch (error) {
      console.error(error);
    }
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

  export const parseResult = (txnsToSign: ScenarioReturnType, result: ScenarioReturnType) => {
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

  }