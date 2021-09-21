import React , {useEffect, useState} from "react";
import {getBalanceByAddress, sendINR, decryptMnemonicWithPasscode, retrieveAccountDetailsFromMnemonic} from './celo_functions';
import BigNumber from "bignumber.js";

import toast, { Toaster } from 'react-hot-toast';


const CryptoWallet = () => {

    const celoAddress = localStorage.getItem("celoAddress");
    const [balance, setBalance] = useState("...");
    const [amounToBeSent, setAmounToBeSent] = useState(0);
    const [receiverCeloAddress, setReceiverCeloAddress] = useState("");


    useEffect( () => {
        refreshBalance();
    },[])

    const refreshBalance = async() => {
        const oneDollar = new BigNumber("1e18");
       const tmp = await getBalanceByAddress(celoAddress);
       setBalance(tmp.dividedBy(oneDollar).toString());
    }

    const sendCrypto = async() => {
        // sendINR
        if(amounToBeSent == 0) {
            toast.error("Amount can't be 0");
            return;
        }

        if(receiverCeloAddress == "") {
            toast.error("Enter receiver's celo address");
            return;
        }

        console.log(amounToBeSent)
        console.log(receiverCeloAddress)



        var passcode = prompt("Enter your passcode to proceed : ");
        if(!passcode) toast.error("Enter passcode");
        if(!passcode) return;

        let decryptedMnemonic;

        try {
            decryptedMnemonic = await decryptMnemonicWithPasscode(localStorage.getItem("celoEncryptedMnemonic"),passcode);
        } catch (error) {
            toast.error("Wrong passcode");
            return;
        }



        console.log(decryptedMnemonic)
        const accountDetails = await retrieveAccountDetailsFromMnemonic(decryptedMnemonic);
        console.log(accountDetails)

        var transactionReceipt;

        try {
            transactionReceipt = await sendINR(accountDetails.address,accountDetails.privateKey, receiverCeloAddress, amounToBeSent);
        } catch (error) {
            console.log(error);
            toast(
                "Check the address & also make sure you have sufficient balance in wallet",
                {
                  duration: 6000,
                }
              );
            toast.error("Failed to send");
            return;
        }



        if(transactionReceipt.status){
            toast.success("Transaction Successful");
        }else{
            toast.error("Transaction Failed");
        }
        refreshBalance();
    }



    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
            <h1 class="text-center header my-5 py-3">Kampus Vire</h1>
            <h1 class="text-center rubik fw-bold mt-5 pt-5 mb-3">
                Crypto Wallet
                <img src="https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png" height="50px" />
            </h1>
            <div class="container bg-light d-flex flex-column align-items-center justify-content-center round border mt-5"
        style={{height: "15rem" , width: "90%"}}>
        <h1 class="nunito_sans text-uppercase text-center">Balance</h1>
        <h2 class="Rubik txt-green fw-bold text-uppercase text-center"> <img src="https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png" height="30px" /> {balance}</h2>
    </div>
    <div class="container px-4 my-5">
        <input type="text" class="form-control bg-light text-muted open_sans text-uppercase fst-italic fs-6 py-2"
            value={celoAddress} readOnly={true} />
    </div>

    <div class="d-grid gap-2 d-md-block container  mt-5">
        <button class="btn btn-success bg-green nunito_sans fw-bold text-uppercase" data-bs-toggle="modal" data-bs-target="#sendCelo" type="button">
            Send CELO
        </button>
    </div>

    <div class="modal fade" id="sendCelo" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header pb-2 bg-light">
                    <h1 class="px-4 nunito_sans m-0 fw-bold">Celo <img src="https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png" height="50px" /></h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0">
                    <input type="text" class="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2 my-3" placeholder="Celo Address" value={receiverCeloAddress} onInput={(e)=>setReceiverCeloAddress(e.target.value)}  />
                    <input type="text" class="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2 my-3" placeholder="Amount in INR" onInput={(e)=>setAmounToBeSent(e.target.value)} />
                </div>
                <div class="modal-footer border-0">
                    <div class="d-grid gap-2 d-md-block container">

                        <button type="button" class="btn bg-green text-light rubik" onClick={sendCrypto} >Send</button>
                        <button type="button" class="btn bg-white txt-green rubik" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        </>
    );
}

export default CryptoWallet;