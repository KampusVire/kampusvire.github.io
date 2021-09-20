import React, { useState } from 'react';
import { ENDPOINT } from './config';
import axios from "axios";
import FormData from 'form-data';

const RegisterUser = (props, context)=>{
    const [step, setStep] = useState(1);
    // This is like enum
    // 1: OTP Request
    // 2: OTP Verification
    const [phoneno, setPhoneno] = useState('');
    const [otpId, setOtpId] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
 
    function requestOTP(){
        setIsLoading(true);
        var data = new FormData();
        data.append('phoneno', phoneno);
        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/request/`,
            data : data
          };
          
        axios(config)
        .then(function (response) {
            if(response.data.success){
                setOtpId(response.data.otp_id);
                setStep(2);
                setError('');
            }else{
                setError(response.data.error);
            }
        })
        .catch(function (error) {
            setError("Failed to request");
        });
        setIsLoading(false);
    }

    function verifyOTP(){
        setIsLoading(true);
        var data = new FormData();
        data.append('otp_id', otpId);
        data.append('otp', otp);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/verify/`,
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if(response.data.success){
                setError('');
                loginUserPostOperation(otpId, response.data.otp_token);
            }else{
                setError(response.data.error);
            }
        })
        .catch(function (error) {
            setError("Failed to request");
        });
        setIsLoading(false);
    }

    function loginUserPostOperation(otp_id, otp_token){
        var data = new FormData();
        data.append('otp_id', otp_id);
        data.append('otp_token', otp_token);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/login/`,
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if(response.data.success){
                setError('');
                localStorage.setItem('token', response.data.token);
                window.location.href = '/';
            }else{
                setError(response.data.error);
            }
        })
        .catch(function (error) {
            setError("Failed to request");
        });
    }

    return (
        <>
        {step === 1 ?(
            <div>
                <label>Enter Mobile no  </label>
                <input value={phoneno} onChange={(event)=>{setPhoneno(event.target.value)}} /><br/>
                <button onClick={()=>{requestOTP()}}>Request OTP</button>
            </div>
            )
          : step === 2 ? (
              <div>
                <label>Enter Otp</label>
                <input value={otp} onChange={(event)=>{setOtp(event.target.value)}} /><br/>
                <button onClick={()=>{verifyOTP()}}>Verify OTP</button>
              </div>
              ) : 
          (<div>Not yet</div>)
          }
        </>
    );
}

export default RegisterUser;