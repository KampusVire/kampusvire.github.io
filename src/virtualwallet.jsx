import React, { useState } from "react"
import {getBalance} from "./wallet_functions"
import {  ENDPOINT } from './config';
import useRazorpay from "react-razorpay";

const VirtualWallet = () => {

    const [balance, setBalance] = useState("..")
    let loaded = false
    let userId = "";
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
        var amount = prompt("enter the amount you want to add in wallet");
        if(!amount) return;
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
        <div>
            <h1>Virtual Wallet</h1>
            <h6>Balance : {balance}</h6>
            <button onClick={addBalance}>Add balance</button>
        </div>
        </>
    );
}

export default VirtualWallet;