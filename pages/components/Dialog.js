export default function Dialog({state, children=null}) {
  const [dialog, setDialog] = state;
  if (dialog.show) return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={()=>setDialog({...dialog, show: false})}>✕</button>
        <div className="flex flex-col">
          <div className="flex justify-center p-4">
            <div className="text-lg font-bold">{dialog.title}</div>
          </div>

          {children}

        </div>
      </div>
    </div>
  )
  else return null;
}


