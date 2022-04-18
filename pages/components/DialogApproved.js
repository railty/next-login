export default function DialogApproved({onSubmit, onCancel}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={()=>onCancel()}>✕</button>
        <div className="flex flex-col">
          <div className="flex justify-center p-4">
            <div className="text-lg font-bold">Call Request Approved</div>
          </div>

          <div className="flex justify-center p-4 overflow-x-auto">
            <table class="table w-full">
              <tbody>
                <tr>
                  <th>Method</th>
                  <td>Cy Ganderton</td>
                </tr>
                <tr>
                  <th>Atomic group</th>
                  <td>Hart Hagerty</td>
                </tr>
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


