import { useState } from "react";
import Dialog from "./components/Dialog";
import DialogApproved from "./components/DialogApproved";
import DialogRejected from "./components/DialogRejected";

export default function Home() {

  const [datPending, setDatPending] = useState({
    show: false, 
    title: "Pending Call Request",
  });

  const [showApproved, setShowApproved] = useState(false);
  const [datRejected, setDatRejected] = useState({
    show: false, 
    title: "Call Request Rejected",
  });

  const pending = ()=>{
    console.log("pending");
    setDatPending({
      ...datPending,
      show: true
    });
  }
  const approved = ()=>{
    console.log("approve");
    setShowApproved(true);
  }

  const rejected = ()=>{
    setDatRejected({
      ...datRejected,
      title: "dadadada",
      show: true
    });
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
      <Dialog state={[datPending, setDatPending]} >
        <div className="flex justify-center p-4 ">
          <button className="btn btn-circle btn-accent loading"></button>
        </div>

        <div className="flex justify-center p-4">
          <div className="font-bold">Approve or reject request using your wallet</div>
        </div>
      </Dialog>

      {showApproved && <DialogApproved onSubmit={null} onCancel={()=>setShowApproved(false)}/>}
      <Dialog state={[datRejected, setDatRejected]} />
    </div>
  )
}


