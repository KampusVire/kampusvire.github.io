import React, { useState } from "react";
import QrReader from "react-qr-scanner";
import {
  decryptMnemonicWithPasscode,
  retrieveAccountDetailsFromMnemonic,
  sendINR,
} from "./celo_functions";
import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import moneyIcon from "./components/img/money.png";

const QRScanPay = () => {
  const [details, setDetails] = useState("-1");
  let amount = 0;

  const sendCrypto = async () => {
    // sendINR
    var passcode = prompt("Enter your passcode to proceed : ");
    if (!passcode) return;

    const decryptedMnemonic = await decryptMnemonicWithPasscode(
      localStorage.getItem("celoEncryptedMnemonic"),
      passcode
    );
    console.log(decryptedMnemonic);
    const accountDetails = await retrieveAccountDetailsFromMnemonic(
      decryptedMnemonic
    );
    console.log(accountDetails);

    var transactionReceipt = await sendINR(
      accountDetails.address,
      accountDetails.privateKey,
      details["celoAddress"],
      amount
    );
    if (transactionReceipt.status) {
      alert("Transaction Successful");
    } else {
      alert("Transaction Failed");
    }
  };

  const sendMoney = async () => {
    const token = localStorage.getItem("token");

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
      variables: {
        amount: amount,
        paymentType: "virtualwallet",
        toUserId: details["id"],
      },
    });

    var config = {
      method: "post",
      url: GRAPHQL_ENDPOINT,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };

    var response = await axios(config);
    if (response.data == undefined) {
      alert("Failed due to network issue");
      return {};
    }

    var trxId = response.data.data.transferMoney.transactionId;
    console.log(trxId);

    var data = JSON.stringify({
      query: `mutation($transactionIds : [String]!, $transactionHash : [String]){
            processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
              totalTransactions
              successfulTransactions
              details
            }
          }`,
      variables: { transactionIds: [trxId] },
    });
    var config = {
      method: "post",
      url: GRAPHQL_ENDPOINT,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };

    var response = await axios(config);
    // console.log(response)
    if (response.data == undefined) {
      return {};
    }

    if (
      response.data.data.processTransaction.totalTransactions !=
      response.data.data.processTransaction.successfulTransactions
    ) {
      alert("Not sufficient balance in wallet. Please recharge");
      return;
    }

    alert("Transaction successful");
  };

  return (
    <>
      {details == "-1" ? (
        <QrReader
          delay={200}
          style={{ width: "100%", height: "100%" }}
          onError={() => {}}
          onScan={(data) => {
            if (data) {
              setDetails(JSON.parse(data["text"]));
            }
          }}
        />
      ) : (
        <div>
          <div class="container bg-green p-3 d-flex justify-content-around align-items-center">
            {/* <div class="bg-green profilePic mb-3" style="width: 6rem;">
                <img src="/img/user.jpg" class="img-fluid" />
            </div> */}
            <div class="txt-green open_sans fw-bold mx-1 fs-6 rounded bg-light p-2">
              <div class="border-bottom py-1">{details.name}</div>
              <div class="border-bottom py-1">{details.department} </div>
              <div class="border-bottom py-1">{details.year}</div>
            </div>
          </div>
          <div class="container mt-3">
            <img
              src={moneyIcon}
              class="w-50 img-fluid d-block mx-auto my-3"
              alt="..."
            />
            <label for="phoneNumber" class="form-label m-0 nunito_sans fs-5">
              Amount
            </label>
            <br />
            <small class="text-muted open_sans">
              Carefully Enter The Amount{" "}
            </small>
            <input
              type="number"
              class="form-control mt-2 fst-italic"
              id="phoneNumber"
              onChange={(e) => (amount = e.target.value)}
            />
          </div>

          <div class="d-grid gap-2 d-md-block container button">
            <button
              class="btn bg-light text-uppercase txt-green"
              type="button"
              onClick={sendMoney}
            >
              virtual wallet
            </button>
            <button
              class="btn btn-success bg-green text-uppercase"
              type="button"
              onClick={sendCrypto}
            >
              crypto
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QRScanPay;
