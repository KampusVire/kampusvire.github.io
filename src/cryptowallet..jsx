import React , {useEffect, useState} from "react";
import {getBalanceByAddress, sendINR, decryptMnemonicWithPasscode, retrieveAccountDetailsFromMnemonic} from './celo_functions';
import BigNumber from "bignumber.js";
import axios from "axios";
import QrReader from 'react-qr-scanner'

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
        console.log(amounToBeSent)
        console.log(receiverCeloAddress)
        var passcode = prompt("Enter your passcode to proceed : ");
        if(!passcode) return;

        const decryptedMnemonic = await decryptMnemonicWithPasscode(localStorage.getItem("celoEncryptedMnemonic"),passcode);
        console.log(decryptedMnemonic)
        const accountDetails = await retrieveAccountDetailsFromMnemonic(decryptedMnemonic);
        console.log(accountDetails)

        var transactionReceipt = await sendINR(accountDetails.address,accountDetails.privateKey, receiverCeloAddress, amounToBeSent);
        if(transactionReceipt.status){
            alert("Transaction Successful");
        }else{
            alert("Transaction Failed");
        }
        refreshBalance();
    }



    return (
        <>
        <div>
            <h1>Crypto Wallet</h1>
            <h3>Balance {balance} cUSD</h3>
            <button onClick={refreshBalance}>Refresh Balance</button>
            {/* Transfer cash */}
            <input type="text" placeholder="Amount in INR" onInput={(e)=>setAmounToBeSent(e.target.value)} />
            <input type="text" placeholder="Celo Address" value={receiverCeloAddress} onInput={(e)=>setReceiverCeloAddress(e.target.value)} />
            <button onClick={sendCrypto}>Send CELO</button>
            <QrReader
                delay={200}
                style={{width: '100%', height: '100%'}}
                onError={()=>{}}
                onScan={(data)=>{ if (data ) setReceiverCeloAddress(JSON.parse(data.text)["celoAddress"])}}
            />
        </div>
        </>
    );
}

export default CryptoWallet;