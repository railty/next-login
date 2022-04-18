export default function DialogPending({onSubmit, onCancel}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={()=>onCancel()}>✕</button>
        <div className="flex flex-col">
          <div className="flex justify-center p-4">
            <div className="text-lg font-bold">Pending Call Request</div>
          </div>

          <div className="flex justify-center p-4 ">
            <button className="btn btn-circle btn-accent loading"></button>
          </div>

          <div className="flex justify-center p-4">
            <div className="font-bold">Approve or reject request using your wallet</div>
          </div>

        </div>
      </div>
    </div>
  )
}


