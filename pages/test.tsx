import { useState } from "react";
import DialogPending from "./components/DialogPending";
import DialogApproved from "./components/DialogApproved";

export default function Home() {

  const [show, setShow] = useState(false);
  const [showApproved, setShowApproved] = useState(false);

  const pay = ()=>{
    console.log("pay");
    setShow(true);
  }
  const approved = ()=>{
    console.log("approve");
    setShowApproved(true);
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="justify-center">
        <button className='btn btn-sm btn-primary' onClick={pay}>Pay</button>
        <button className='btn btn-sm btn-primary' onClick={approved}>Approved</button>
      </div>
        
      <div className="flex flex-col justify-center">
        <div className="flex justify-center">
          <div>aaaa</div>
        </div>
        <div className="flex justify-center">
          <div>bbbb</div>
          
        </div>
        
      </div>

      {show && <DialogPending onSubmit={null} onCancel={()=>setShow(false)}/>}

      {showApproved && <DialogApproved onSubmit={null} onCancel={()=>setShowApproved(false)}/>}
    </div>
  )
}


