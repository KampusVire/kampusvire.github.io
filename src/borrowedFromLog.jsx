import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  

  return (
    <>
      <div>
        <h1>Borrowed From log</h1>
        <button onClick={loadLogs}>Load</button>
        {log.map((snbrw) => {
          return (
            <>
              <div key={snbrw["node"]["objId"]}>
                <p>Amount : {snbrw["node"]["amount"]}</p>
                <p>Description : {snbrw["node"]["description"]}</p>
                <p>Borrowed On : {snbrw["node"]["borrowedOn"]}</p>
                {snbrw["node"]["sender"]["isShop"] ? (
                  <>
                    <div>
                      <p>
                        Name : {snbrw["node"]["sender"]["shopProfile"]["name"]}
                      </p>
                      <p>
                        Phoneno : {snbrw["node"]["sender"]["shopProfile"]["phoneNo"]}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p>
                        Name :{snbrw["node"]["sender"]["studentProfile"]["name"]}
                      </p>
                      <p>
                        Phoneno : {snbrw["node"]["sender"]["studentProfile"]["phoneNo"]}
                      </p>
                      <p>
                        Details : {snbrw["node"]["sender"]["studentProfile"]["department"]} {snbrw["node"]["sender"]["studentProfile"]["year"]} {snbrw["node"]["sender"]["studentProfile"]["rollNo"]}
                      </p>
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

export default BorrowedFromLog;
