export default function TxnInfo({txns}) {
  return (
    <table className="table w-full">
      <tbody>
        <tr>
          <td>Method</td>
          <td>{txns.method}</td>
        </tr>
        {txns.body.map((signedTxns, index) => (
          <tr key={index}>
            <td>{`Atomic group ${index}`}</td>
            <td>
              {signedTxns.map((txn, txnIndex) => (
                <div key={txnIndex}>
                  {!!txn?.txID && <p>TxID: {txn.txID}</p>}
                  {!!txn?.signature && <p>Sig: {txn.signature}</p>}
                  {!!txn?.signingAddress && <p>AuthAddr: {txn.signingAddress}</p>}
                </div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}