import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";

const BorrowedFromLog = () => {
  const [log, setLog] = useState([]);

  const loadLogs = async () => {
      // TODO paid toogle button 
    const token = localStorage.getItem("token");
    var data = JSON.stringify({
      query: `query($borrowType : String!, $paid : Boolean!){
            borrowDetails(borrowType : $borrowType, paid : $paid){
                edges{
                node{
                    objId
                    amount
                    description
                    isPaid
                    borrowedOn
                    returnedOn
                    sender{
                        isShop
                        studentProfile{
                            name
                            department
                            year
                            rollNo
                            phoneNo
                        }
                        shopProfile{
                            objId
                            name
                            phoneNo
                        }
                    }
                }
                }
            }
            }`,
      variables: { borrowType: "from", paid: false },
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
    console.log(response.data.data.borrowDetails.edges);
    setLog(response.data.data.borrowDetails.edges);
  };

  


  useEffect(() => {
    if (log != []) {
      loadLogs();
    }
  }, []);


  return (
    <>
         <div>
        <Navbar />
        <h1 class="text-center open_sans fw-bold txt-green  mb-3">
          Borrowed From 
        </h1>
        <div class="container mt-3">
          {log.map((snbrw) => {
            return (
              <>
              <div class="p-3 border rounded bg-light my-2" key={snbrw["node"]["objId"]}>
              {snbrw["node"]["sender"]["isShop"] ? (
                    <>
                      <div>
                        <div class="row">
                          <div class="col">Name : </div>
                          <div class="col">{snbrw["node"]["sender"]["shopProfile"]["name"]}</div>
                        </div>
                        <div class="row">
                          <div class="col">Phoneno : </div>
                          <div class="col">{snbrw["node"]["sender"]["shopProfile"]["phoneNo"]}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                      <div class="row">
                        <div class="col">Name : </div>
                        <div class="col">{snbrw["node"]["sender"]["studentProfile"]["name"]}</div>
                      </div>
                      <div class="row">
                        <div class="col">Phoneno : </div>
                        <div class="col">{snbrw["node"]["sender"]["studentProfile"]["phoneNo"]}</div>
                      </div>
                      <div class="row">
                        <div class="col">Department : </div>
                        <div class="col">{snbrw["node"]["sender"]["studentProfile"]["department"]}</div>
                      </div>
                      <div class="row">
                        <div class="col">Year : </div>
                        <div class="col">{snbrw["node"]["sender"]["studentProfile"]["year"]}</div>
                      </div>
                      <div class="row">
                        <div class="col">Roll no : </div>
                        <div class="col">{snbrw["node"]["sender"]["studentProfile"]["rollNo"]}</div>
                      </div>
                      </div>
                    </>
                  )}


                <div class="row text-danger border-top">
                  <div class="col fw-bold text-uppercase ">Amount : </div>
                  <div class="col ">&#8377; {snbrw["node"]["amount"]}</div>
                </div>
                <div class="row text-danger border-bottom">
                  <div class="col fw-bold text-uppercase ">Reason : </div>
                  <div class="col ">{snbrw["node"]["description"]}</div>
                </div>
                <div class="row text-danger border-bottom">
                  <div class="col fw-bold text-uppercase ">Borrowed on : </div>
                  <div class="col ">{snbrw["node"]["borrowedOn"]}</div>
                </div>
                <div class="row mt-3 text-center">
                  {/* <div class="col">
                    <button type="button" class="btn bg-green text-light rubik w-75" onClick={()=>{makePaid(snbrw["node"]["objId"])}}>Make Paid</button>
                  </div> */}
                  <div class="col">
                    <a type="button" class="btn btn-outline-success rubik w-75" href={snbrw["node"]["sender"]["isShop"] ? "tel:"+ snbrw["node"]["sender"]["shopProfile"]["phoneNo"] : "tel:"+ snbrw["node"]["sender"]["studentProfile"]["phoneNo"] }>Call</a>
                  </div>
                </div>
              </div>
              </>
            );
          })}
        </div>
      </div>
      </>)
};

export default BorrowedFromLog;
