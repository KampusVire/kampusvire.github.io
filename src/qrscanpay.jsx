import React, { useState } from "react";
import QrReader from "react-qr-scanner";
import {decryptMnemonicWithPasscode, retrieveAccountDetailsFromMnemonic, sendINR} from "./celo_functions";
import axios from "axios";
import {GRAPHQL_ENDPOINT} from "./config";

const QRScanPay = ()=>{
    const [details, setDetails] = useState("-1")
    let amount = 0;

    const sendCrypto = async() => {
        // sendINR
        var passcode = prompt("Enter your passcode to proceed : ");
        if(!passcode) return;

        const decryptedMnemonic = await decryptMnemonicWithPasscode(localStorage.getItem("celoEncryptedMnemonic"),passcode);
        console.log(decryptedMnemonic)
        const accountDetails = await retrieveAccountDetailsFromMnemonic(decryptedMnemonic);
        console.log(accountDetails)

        var transactionReceipt = await sendINR(accountDetails.address,accountDetails.privateKey, details["celoAddress"], amount);
        if(transactionReceipt.status){
            alert("Transaction Successful");
        }else{
            alert("Transaction Failed");
        }
    }

    const sendMoney = async()=>{
        const token = localStorage.getItem('token');

        var data = JSON.stringify({
            query: `mutation($amount : Float!, $paymentType : String!, $toUserId : String!){
            transferMoney(amount : $amount, paymentType : $paymentType, toUserId : $toUserId){
              success
              message
              paymentType
              transactionId
              redirectPaymentPage
            }
          }`,
            variables: {"amount":amount,"paymentType":"virtualwallet","toUserId":details["id"]}
          });
        

          var config = {
            method: 'post',
            url: GRAPHQL_ENDPOINT,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            data : data
        };
    
        var response = await axios(config);
        if (response.data == undefined){
            alert("Failed due to network issue")
            return {};
        };

        var trxId = response.data.data.transferMoney.transactionId;
        console.log(trxId)

        var data = JSON.stringify({
            query: `mutation($transactionIds : [String]!, $transactionHash : [String]){
            processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
              totalTransactions
              successfulTransactions
              details
            }
          }`,
            variables: {"transactionIds": [trxId]}
          });
          var config = {
            method: 'post',
            url: GRAPHQL_ENDPOINT,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            data : data
        };
    
        var response = await axios(config);
        // console.log(response)
        if (response.data == undefined){
            return {};
        };

        if(response.data.data.processTransaction.totalTransactions != response.data.data.processTransaction.successfulTransactions){
            alert("Not sufficient balance in wallet. Please recharge")
            return;
        }

        alert("Transaction successful")

    }

    return (
        <>
        
        {
            details == "-1" ? (
                <QrReader
            delay={200}
            style={{width: '100%', height: '100%'}}
            onError={() => {}}
            onScan={(data) => {
                if (data){
                    setDetails(JSON.parse(data["text"]))
                }
            }}
        />
            ) : (
                <div>
                    <h1>Name : {details.name}</h1>
                    <h1>Department : {details.department}</h1>
                    <h1>Year : {details.year}</h1>
                    <input type="number" onChange={(e)=>amount=e.target.value}/>
                    <button onClick={sendMoney}>Pay with wallet</button>
                    <button onClick={sendCrypto}>Pay with crypto</button>
                </div>
            )
        }

        </>
    )
}

export default QRScanPay;