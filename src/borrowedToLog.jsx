import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BorrowedToLog = () => {
  const [log, setLog] = useState([]);

  const loadLogs = async () => {
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
                    receiver{
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
      variables: { borrowType: "to", paid: false },
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

  const makePaid = async (id)=>{
    const token = localStorage.getItem("token");
    var data = JSON.stringify({
        query: `mutation($borrowId : String!){
        borrowPaid(borrowId : $borrowId){
          success
          message
          error
        }
      }`,
        variables: {"borrowId":id}
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
      return;
    }

    console.log(response);
  }

  return (
    <>
      <div>
        <h1>Borrowed To log</h1>
        <button onClick={loadLogs}>Load</button>
        {log.map((snbrw) => {
          return (
            <>
              <div key={snbrw["node"]["objId"]}>
                <p>Amount : {snbrw["node"]["amount"]}</p>
                <p>Description : {snbrw["node"]["description"]}</p>
                <p>Borrowed On : {snbrw["node"]["borrowedOn"]}</p>
                {snbrw["node"]["receiver"]["isShop"] ? (
                  <>
                    <div>
                      <p>
                        Name : {snbrw["node"]["receiver"]["shopProfile"]["name"]}
                      </p>
                      <p>
                        Phoneno : {snbrw["node"]["receiver"]["shopProfile"]["phoneNo"]}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p>
                        Name :{snbrw["node"]["receiver"]["studentProfile"]["name"]}
                      </p>
                      <p>
                        Phoneno : {snbrw["node"]["receiver"]["studentProfile"]["phoneNo"]}
                      </p>
                      <p>
                        Details : {snbrw["node"]["receiver"]["studentProfile"]["department"]} {snbrw["node"]["receiver"]["studentProfile"]["year"]} {snbrw["node"]["receiver"]["studentProfile"]["rollNo"]}
                      </p>
                      <button onClick={()=>{makePaid(snbrw["node"]["objId"])}}>Make aid</button>
                    </div>
                  </>
                )}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default BorrowedToLog;
