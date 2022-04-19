import { useState } from "react";
import DialogPending from "./components/DialogPending";
import DialogApproved from "./components/DialogApproved";
import DialogRejected from "./components/DialogRejected";

export default function Home() {

  const [showPending, setShowPending] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [showRejected, setShowRejected] = useState(false);

  const pending = ()=>{
    console.log("pay");
    setShowPending(true);
  }
  const approved = ()=>{
    console.log("approve");
    setShowApproved(true);
  }

  const rejected = ()=>{
    console.log("rejected");
    setShowRejected(true);
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="justify-center">
        <button className='btn btn-sm btn-primary' onClick={pending}>Pending</button>
        <button className='btn btn-sm btn-primary' onClick={approved}>Approved</button>
        <button className='btn btn-sm btn-primary' onClick={rejected}>Rejected</button>
      </div>
        
      <div className="flex flex-col justify-center">
        <div className="flex justify-center">
          <div>aaaa</div>
        </div>
        <div className="flex justify-center">
          <div>bbbb</div>
          
        </div>
        
      </div>

      {showPending && <DialogPending onSubmit={null} onCancel={()=>setShowPending(false)}/>}
      {showApproved && <DialogApproved onSubmit={null} onCancel={()=>setShowApproved(false)}/>}
      {showRejected && <DialogRejected onCancel={()=>setShowRejected(false)}/>}
    </div>
  )
}


