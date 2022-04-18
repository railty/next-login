export default function DialogApproved({onSubmit, onCancel, result}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={()=>onCancel()}>✕</button>
        <div className="flex flex-col">
          <div className="flex justify-center p-4">
            <div className="text-lg font-bold">Call Request Approved</div>
          </div>

          <div className="flex justify-center p-4 overflow-x-auto">
            <table className="table w-full">
              <tbody>
                <tr>
                  <td>Method</td>
                  <td>{result.method}</td>
                </tr>
                {result.body.map((signedTxns, index) => (
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
          </div>

          <div className="flex justify-center p-4">
            <button className="btn btn-primary">Submit to network</button>
          </div>

        </div>
      </div>
    </div>
  )
}


