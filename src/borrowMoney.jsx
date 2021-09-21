import axios from "axios";
import {GRAPHQL_ENDPOINT} from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QrReader from "react-qr-scanner";
import icon from "./components/img/icon.png"


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
    <div>{
          details == "-1" ? (
                <>
                <h4>Scan the QR code of the user from whom you want to borrow</h4>
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
                </>

            ) : (
                <div>
                <div className="container mb-3 bg-green px-4 py-2 mb-5">
                    <div className="d-flex justify-content-center align-items-center " style={{width: "6rem"}}>
                        <img src={icon} className="img-fluid"/>
                    </div>
                </div>
                <h1 className="text-center open_sans fw-bold txt-green">Borrow Money</h1>
                <div className="container w-50 mt-5">
                    <p>Name : {details["name"]}</p>
                    <p>Department : {details["department"]}</p>
                    <p>Year : {details["year"]}</p>
                    {/* <img className="img-fluid p-2" src ="/img/user.jpg"></img> */}
                </div>
                <div className="container px-3 mt-3">
                    <label for="amoount" className="form-label m-0 nunito_sans fs-5">Amount</label><br />
                    <small className="text-muted open_sans">Carefully Enter The Amount </small>
                    <input  className="form-control mt-2 fst-italic"  type="number" placeholder="Enter amount" onInput={(e)=>amount=e.target.value}/>
                </div>
                <div className="container px-3 mt-3">
                    <label for="description" className="form-label m-0 nunito_sans fs-5">Description</label><br />
                    <input className="form-control mt-2 fst-italic" id="description" type="text"  defaultValue="Borrowing" onInput={(e)=>description=e.target.value} />
                </div>
                
                <div className="d-grid gap-2 d-md-block container button">
                    <button className="btn btn-success bg-green text-uppercase" type="button" onClick={borrowMoney}>Borrow</button>
                </div>


                </div>
            )}

    </div>
    </>);
}

export default BorrowMoney;