import React, {  useState } from 'react';
import QRCode from "react-qr-code";
import axios from 'axios';
import { GRAPHQL_ENDPOINT } from './config';
import { Link } from 'react-router-dom';

const Home = ()=>{
    // State related variables
    const [receivedUserData, setReceivedUserData] = useState(false);
    // Other
    const [qrCodeData, setQrCodeData] = useState("-1");
    var jsonData = {};
    const token = localStorage.getItem('token');

    var data = JSON.stringify({
            query: `query{
            baseProfileDetails{
                objId
                phoneNo
                isShop
                walletBalance
                celoEncryptedMnemonic
                celoAddress
                studentProfile{
                id
                objId
                name
                collegeName
                department
                year
                rollNo
                emailId
                phoneNo
                }
            }
            }`,
            variables: {}
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

    if(!receivedUserData){
        axios(config)
        .then(function (response) {
            setReceivedUserData(true);
            jsonData = {
                id : response.data.data.baseProfileDetails.objId,
                name : response.data.data.baseProfileDetails.studentProfile.name,
                department : response.data.data.baseProfileDetails.studentProfile.department,
                year : response.data.data.baseProfileDetails.studentProfile.year,
            }
            setQrCodeData(JSON.stringify(jsonData));
        })
        .catch(function (error) {
            console.log(error);
        });
    }        



    return (
        <>
        <h1>Hello This a Home page</h1>
        {qrCodeData != "-1" ? <h5>Hi {JSON.parse(qrCodeData).name}</h5> : <a>Loading...</a>}
        <QRCode value={qrCodeData} />
        <br></br>
        <Link to="/shops">All Shops</Link>
        </>
    );
}

export default Home;