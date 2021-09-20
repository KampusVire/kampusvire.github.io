import React, { useRef, useState } from 'react';
import { ENDPOINT } from './config';
import axios from "axios";
import FormData from 'form-data';
import { getNewMnemonic, retrieveAccountDetailsFromMnemonic, encryptMnemonicWithPasscode } from './celo_functions';

const RegisterUser = (props, context)=>{
    const [step, setStep] = useState(1);
    // This is like enum
    // 1: OTP Request
    // 2: OTP Verification
    // 3. Write down the celo menmonic
    // 4. Enter passcode
    // 5. Registration information

    console.log("HI");

    const mnemonicCelo = getNewMnemonic();
    const addressCelo = retrieveAccountDetailsFromMnemonic(mnemonicCelo)["address"];
    let registerData = useRef({
        otpToken : "",
        otpId : "",
        otp : "",
        passcode : "",
        phoneno : "",
        name : "",
        email_id : "",
        college_name : "",
        department : "",
        year : "",
        roll_no : ""
    });

    const handleReset = () => {
        Array.from(document.querySelectorAll("input")).forEach(
            input => (input.value = "")
        );
    };


async function requestOTP(){
        // setIsLoading(true);
        var data = new FormData();
        data.append('phoneno', registerData.current["phoneno"]);
        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/request/`,
            data : data
          };
          
        axios(config)
        .then(function (response) {
            if(response.data.success){
                registerData.current["otpId"] =  response.data.otp_id;
                console.log(registerData.current["otpId"]);
                handleReset();
                setStep(2);
                // setError('');
            }else{
                // setError(response.data.error);
            }
        })
        .catch(function (error) {
            // setError("Failed to request");
        });
        // setIsLoading(false);
    }
    

 async function verifyOTP(){
        // setIsLoading(true);
        var data = new FormData();
        data.append('otp_id', registerData.current["otpId"]);
        data.append('otp', registerData.current["otp"]);

        console.log(registerData.current["otpId"]);
        console.log(registerData.current["otp"]);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/verify/`,
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if(response.data.success){
                registerData.current["otpToken"] = response.data.otp_token;
                // setError('');
                handleReset();
                setStep(3);
            }else{
                // setError(response.data.error);
            }
        })
        .catch(function (error) {
            // setError("Failed to request");
        });
    //    setIsLoading(false);
    }

    function registerUser(){
        var data = new FormData();

        data.append('otp_id', registerData.current["otpId"]);
        data.append('otp_token', registerData.current["otpToken"]);
        data.append('celo_mnemonic_encrypted', encryptMnemonicWithPasscode(mnemonicCelo, registerData.current["passcode"]));
        data.append('celo_address', addressCelo);
        data.append('passcode', registerData.current["passcode"]);
        data.append('name', registerData.current["name"]);
        data.append('college_name', registerData.current["college_name"]);
        data.append('department', registerData.current["department"]);
        data.append('year', registerData.current["year"]);
        data.append('roll_no', registerData.current["roll_no"]);
        data.append('email_id', registerData.current["email_id"]);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/register/`,
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if(response.data.success){
                // setError('');
                localStorage.setItem('token', response.data.token);
                window.location.href = '/';
            }else{
                // setError(response.data.error);
            }
        })
        .catch(function (error) {
            // setError("Failed to request");
        });
    }

    return (
        <>
        {step === 1 ?(
            <div>
                <label>Enter Mobile no  </label>
                <input type="text" id="phoneno" onChange={(e)=>registerData.current["phoneno"]=e.target.value}/>
                <button onClick={()=>{requestOTP()}}>Request OTP</button>
            </div>
            )
          : step === 2 ? (
              <div>
                <label>Enter Otp</label>
                <input id="otp"  defaultValue="" onChange={(event)=>{registerData.current["otp"] = event.target.value}} /><br/>
                <button onClick={()=>{verifyOTP()}}>Verify OTP</button>
              </div>
              ) : 
              step  === 3 ? (
                  <div>
                    <a>Write down the below mnemonic in a safe place . So that in case you lose access to account you can get access to celo wallet</a>
                    <pre>{mnemonicCelo}</pre>
                    <button onClick={()=>setStep(4)}>Next</button>
                  </div>
                ) :
            step === 4 ? (
                    <div>
                        <label>Enter passcode</label>
                        <input itemID="passcode" onChange={(event)=>{registerData.current["passcode"] = event.target.value}} /><br/>
                        <button onClick={()=>{setStep(5);handleReset();}}>Next</button>
                    </div>
                    ) :
            step === 5 ? (
                    <div>
                        <label>Enter your name</label>
                        <input id="name" onChange={(event)=>{registerData.current["name"] = event.target.value}} /><br/>
                        <label>Enter your email id</label>
                        <input id="emailid" onChange={(event)=>{registerData.current["email_id"] = event.target.value}} /><br/>
                        <label>Enter your college name</label>
                        <input id="college_name"  onChange={(event)=>{registerData.current["college_name"] = event.target.value}} /><br/>
                        <label>Enter your department</label>
                        <input id="department" onChange={(event)=>{registerData.current["department"] = event.target.value}} /><br/>
                        <label>Enter your year</label>
                        <input id="year" onChange={(event)=>{registerData.current["year"] = event.target.value}} /><br/>
                        <label>Enter your roll no</label>
                        <input id="roll_no" onChange={(event)=>{registerData.current["roll_no"] = event.target.value}} /><br/>
                        <button onClick={registerUser}>Register</button>
                    </div>
            ) :
          (<div>Wait..</div>)
          }
        </>
    );
}

export default RegisterUser;