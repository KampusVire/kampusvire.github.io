import React, { useState } from 'react';
import { ENDPOINT } from './config';
import axios from "axios";
import FormData from 'form-data';
import './components/style.css'
import './components/common.css'

const LoginUser = (props, context) => {
    const [step, setStep] = useState(1);
    // This is like enum
    // 1: OTP Request
    // 2: OTP Verification
    const [phoneno, setPhoneno] = useState('');
    const [otpId, setOtpId] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    function requestOTP() {
        setIsLoading(true);
        var data = new FormData();
        data.append('phoneno', phoneno);
        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/request/`,
            data: data
        };

        axios(config)
            .then(function (response) {
                if (response.data.success) {
                    setOtpId(response.data.otp_id);
                    setStep(2);
                    setError('');
                } else {
                    setError(response.data.error);
                }
            })
            .catch(function (error) {
                setError("Failed to request");
            });
        setIsLoading(false);
    }

    function verifyOTP() {
        setIsLoading(true);
        var data = new FormData();
        data.append('otp_id', otpId);
        data.append('otp', otp);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/verify/`,
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(response);
                if (response.data.success) {
                    setError('');
                    loginUserPostOperation(otpId, response.data.otp_token);
                } else {
                    setError(response.data.error);
                }
            })
            .catch(function (error) {
                setError("Failed to request");
            });
        setIsLoading(false);
    }

    function loginUserPostOperation(otp_id, otp_token) {
        var data = new FormData();
        data.append('otp_id', otp_id);
        data.append('otp_token', otp_token);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/login/`,
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(response);
                if (response.data.success) {
                    setError('');
                    localStorage.setItem('token', response.data.token);
                    window.location.href = '/';
                } else {
                    setError(response.data.error);
                }
            })
            .catch(function (error) {
                setError("Failed to request");
            });
    }

    return (
        <>
            {step === 1 ? (
                <div>
                    <h1 className="text-center header">Kampus Vire</h1>

                    <div className="my-5 container">
                        <label for="phoneNumber" className="form-label m-0 nunito_sans fs-4">Your Mobile Number</label><br />
                        <small className="text-muted open_sans">We will send an otp for verification</small>
                        <input type="phone" className="form-control mt-4 fst-italic" id="phoneNumber" placeholder="Phone Number" value={phoneno} onChange={(event) => { setPhoneno(event.target.value) }} />
                        {/* <!--When OTP is send Display This in addtion--> */}
                        {/* <p className ="fs-6 text-center my-3 rubik">
                        Didn’t recieve OTP?<b className ="text-primary">Resend</b> in  <b>60s</b> <br/>
                        <a href="#" className ="text-decoration-none rubik">Change phone Number</a>
                        </p> */}
                    </div>
                    <div className="d-grid gap-2 d-md-block container button">
                        <button className="btn bg-green text-light" type="button" onClick={() => { requestOTP() }}>Continue</button>
                    </div>

                    {/* <label>Enter Mobile no  </label>
                    <input value={phoneno} onChange={(event) => { setPhoneno(event.target.value) }} /><br />
                    <button onClick={() => { requestOTP() }}>Request OTP</button> */}
                </div>
            )
                : step === 2 ? (

                    <div>
                    <h1 className="text-center header">Kampus Vire</h1>

                    <div className="my-5 container">
                        <label for="phoneNumber" className="form-label m-0 nunito_sans fs-4">Enter The OTP</label><br />
                        <small className="text-muted open_sans">Please enter the OTP sent</small>
                        <input type="phone" className="form-control mt-4 fst-italic" placeholder="Enter the OTP" value={otp} onChange={(event) => { setOtp(event.target.value) }} />
                        {/* <!--When OTP is send Display This in addtion--> */}
                        <p className ="fs-6 text-center my-3 rubik">
                        Didn’t recieve OTP?<b className ="text-primary">Resend</b> in  <b>60s</b> <br/>
                        <a href="#" className ="text-decoration-none rubik">Change phone Number</a>
                        </p>
                    </div>
                    <div className="d-grid gap-2 d-md-block container button">
                        <button className="btn bg-green text-light" type="button" onClick={() => { verifyOTP() }}>Continue</button>
                    </div>



                        {/* <label>Enter Otp</label>
                        <input value={otp} onChange={(event) => { setOtp(event.target.value) }} /><br />
                        <button onClick={() => { verifyOTP() }}>Verify OTP</button> */}
                    </div>
                ) :
                    (<div>Not yet</div>)
            }
        </>
    );
}

export default LoginUser;