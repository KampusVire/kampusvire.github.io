import React, { useState } from 'react';
import QRCode from "react-qr-code";
import axios from 'axios';
import { GRAPHQL_ENDPOINT } from './config';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import './components/home.css'

const Home = () => {
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
            'Authorization': `Bearer ${token}`
        },
        data: data
    };

    if (!receivedUserData) {
        axios(config)
            .then(function (response) {
                setReceivedUserData(true);
                jsonData = {
                    id: response.data.data.baseProfileDetails.objId,
                    name: response.data.data.baseProfileDetails.studentProfile.name,
                    department: response.data.data.baseProfileDetails.studentProfile.department,
                    year: response.data.data.baseProfileDetails.studentProfile.year,
                }
                setQrCodeData(JSON.stringify(jsonData));
            })
            .catch(function (error) {
                console.log(error);
            });
    }



    return (
        <>
            <Navbar />
            <div id="reduceOpacity" className="opacity-100">
                <div className="container p-3 mt-4">
                    <div className="fs-6 open_sans text-center mx-5 my-2">
                        {qrCodeData != "-1" ? <div>Hi {JSON.parse(qrCodeData).name} Simply scan this QR code to recieve desired payment</div> : <a>Loading...</a>}
                    </div>
                    <div className="QrImg">
                        <QRCode value={qrCodeData} />
                    </div>
                    <div className="fs-6 open_sans text-center my-2 txt-green fw-bold" data-bs-target="#mymodel" data-bs-toggle="modal">
                        Click here to expand the QR code
                    </div>
                </div>

                <div className="d-grid gap-2 d-md-block container mt-5">
                    <button className="btn btn-success bg-green nunito_sans fw-bold" type="button">Scan And Pay</button>
                    <button className="btn bg-white txt-green nunito_sans fw-bold mt-3" type="button">
                        <Link to="/shops" className="nunito_sans fw-bold txt-green text-decoration-none">All Shops</Link>
                    </button>
                </div>


                {/* Modal */}
                <div className="modal " tabIndex="-1" id="mymodel">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">QR Code</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="QrImgModal">
                                    <QRCode value={qrCodeData} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="d-grid gap-2 d-md-block container">
                                    <button className="btn btn-success bg-green nunito_sans fw-bold" type="button">Scan And Pay</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* {qrCodeData != "-1" ? <h5>Hi {JSON.parse(qrCodeData).name}</h5> : <a>Loading...</a>} */}
                {/* <QRCode value={qrCodeData} /> */}
                {/* <br></br> */}
                {/* <Link to="/shops">All Shops</Link> */}
            </div>
        </>
    );
}

export default Home;