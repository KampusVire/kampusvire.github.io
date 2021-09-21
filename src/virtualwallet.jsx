import React, { useState } from "react"
import {getBalance} from "./wallet_functions"
import {  ENDPOINT } from './config';
import useRazorpay from "react-razorpay";
import toast, { Toaster } from 'react-hot-toast';

const VirtualWallet = () => {

    const [balance, setBalance] = useState("..")
    let loaded = false
    let userId = "";
    let amount = 0;
    const Razorpay = useRazorpay()

    async function getInfos(){
        var response = await getBalance()
        userId = response["objId"]
        loaded = true
        setBalance(response["balance"] ? response["balance"] : 0)
        console.log(userId)
    }

    if(!loaded){
        getInfos();
    }

    async function addBalance(){
        if(amount == 0){
            toast('Amount can\'t be 0',
            {
                icon: '👏',
                style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                },
            }
            );
            return;
        }
        const options = {
            key: "rzp_test_YYYJHE9VNyqobl", // Enter the Key ID generated from the Dashboard
            amount: amount*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: "INR",
            name: "",
            description: "Test Transaction",
            // image: "https://example.com/your_logo",
            handler: function (response) {
                window.location.href = `${ENDPOINT}/api/verify/addtowallet/${response.razorpay_payment_id}/`
            },
            prefill: {
              name: "",
              contact: "",
            },
            notes: {
                "TYPE" : "WALLETRECHARGE",
                "USERID" : userId
            },
            theme: {
              color: "#3399cc",
            },
          };
        
          const rzp1 = new Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            alert(response.error.description);
          });
          rzp1.open();
    }


    return (
        <>
        <Toaster
            position="top-right"
            reverseOrder={false}
        />
        <h1 class="text-center header my-5 py-3">Kampus Vire</h1>
        <h1 class="text-center rubik fw-bold mt-5 pt-5 mb-3">
            Virtual Wallet
            <i class="fas fa-coins text-warning"></i>
        </h1>

        <div class="container bg-light d-flex flex-column align-items-center justify-content-center round border mt-5" style={{height: "15rem" , width: "90%"}}>
            <h1 class="nunito_sans text-uppercase text-center">Balance</h1>
            <h2 class="Rubik txt-green fw-bold text-uppercase text-center">&#8377; {balance}</h2>    
        </div>
        <div class="container px-4 my-5">
            <input type="number" class="form-control bg-light text-muted open_sans text-uppercase fst-italic fs-6 py-2"
                placeholder="Amount to Pay" onChange={(e)=>amount=e.target.value} />
        </div>
        <div class="d-grid gap-2 d-md-block container button mt-5">
            <button class="btn btn-success bg-green nunito_sans fw-bold" type="button" onClick={addBalance}>Add Money</button>
        </div>

        </>
    );
}

export default VirtualWallet;