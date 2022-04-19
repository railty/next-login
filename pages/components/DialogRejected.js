export default function DialogRejected({onCancel}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={()=>onCancel()}>✕</button>
        <div className="flex flex-col">
          <div className="flex justify-center p-4">
            <div className="text-lg font-bold">Call Request Rejected</div>
          </div>
        </div>
      </div>
    </div>
  )
}


