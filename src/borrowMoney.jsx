import axios from "axios";
import {GRAPHQL_ENDPOINT} from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QrReader from "react-qr-scanner";


const BorrowMoney = ()=>{
    const [details, setDetails] = useState("-1")
    let amount = 0;
    let description = "Borrowing"

    const borrowMoney = async()=>{
        const token = localStorage.getItem('token');
        var data = JSON.stringify({
            query: `mutation($userIdTo : String!, $amount : Float!, $description : String!){
            borrowInitiate(userIdTo : $userIdTo, amount : $amount, description : $description){
              success
              message
              error
            }
          }`,
            variables: {"userIdTo":details["id"],"amount":amount,"description":description}
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
        console.log(response);

    }

    return (<>
    <div>
        <h1>borrow money</h1>
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
                    <p>Name : {details["name"]}</p>
                    <p>Department : {details["department"]}</p>
                    <p>Year : {details["year"]}</p>
                    <input type="number" placeholder="Enter amount" onInput={(e)=>amount=e.target.value} />
                    <input type="text"  defaultValue="Borrowing" onInput={(e)=>description=e.target.value} />
                    <button onClick={borrowMoney}>Borrow</button>
                </div>
            )}

    </div>
    </>);
}

export default BorrowMoney;