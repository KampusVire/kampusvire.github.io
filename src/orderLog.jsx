import axios from "axios";
import {ENDPOINT, GRAPHQL_ENDPOINT} from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QrReader from "react-qr-scanner";
import icon from "./components/img/icon.png"
import Navbar from "./components/Navbar";
import toast, { Toaster } from 'react-hot-toast';
import "./components/transaction_card.css";

function useForceUpdate(){
    let [value, setState] = useState(true);
    return () => setState(!value);
}    

const OrderLog = ()=>{
    let forceUpdate = useForceUpdate()
    const [loaded,setLoaded] = useState(false);
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    const isShop = localStorage.getItem('isShop');

    const loadOrderLog = async () => {
        console.log("HI");

        var data = JSON.stringify({
            query: `query($orderStatus : String){
            orders(orderStatus : $orderStatus){
              edges{
                node{
                  objId
                  isPreorder
                  preorderScheduledTime
                  orderStatus
                  price
                  data
                  buyer{
                    objId
                    name
                    phoneNo
                  }
                  shop{
                    objId
                    name
                    phoneNo
                  }
                  transactionDetails{
                    objId
                    paymentType
                    status
                  }
                }
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
    
        var response = await axios(config);
        if (response.data == undefined){
            toast.error("Failed due to network issue")
            return;
        };
        console.log(JSON.stringify(response.data.data.orders.edges));
        setLoaded(true);
        setOrders(response.data.data.orders.edges);
        // setOrders
    }

    const updateOrderStatus = async(index,orderId, status)=>{
        toast.success("Updating....");
        var data = JSON.stringify({
            query: `mutation($orderId : String!, $status : String!){
            orderStatusUpdate(orderId : $orderId,status:$status){
              success
              message
              error
            }
          }`,
            variables: {"orderId": orderId.toString(),"status":status}
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
            toast.error("Failed due to network issue")
            return;
        };

        console.log(response.data)

        if(response.data.data.orderStatusUpdate.success){
            toast.success(response.data.data.orderStatusUpdate.message)
            let tmpData = orders;
            console.log(orders[index])
    
            if(status == "completed"){
                tmpData[index]["node"]["orderStatus"] = "COMPLETED"
            }else if(status == "cancelled"){
                tmpData[index]["node"]["orderStatus"] = "CANCELLED"
            }else if(status == "processing"){
                tmpData[index]["node"]["orderStatus"] = "PROCESSING"
            }
    
            console.log(tmpData[index].node.orderStatus)
    
            setOrders(tmpData);
            forceUpdate();

        }else{
            toast.error(response.data.data.orderStatusUpdate.error)
        }

    }

    if(!loaded){
        loadOrderLog();
    }


    return (<>
        <Navbar/>
        <Toaster
            position="top-right"
            reverseOrder={false}
        />
        <div class="card p-3">
            <h5 class="card-title text-uppercase rubik fw-bold text-center">ODER DETAILS</h5>
            {orders.map((order, index)=>{
                return (
                    <>
                    <div class="card  m-3 bg-light mb-3" key={order.node.objId}>
            <div class="card-body ">
                <div class="row mb-1">
                    <div class="col">Name : </div>
                    <div class="col">{order.node.isShop ? order.node.buyer.name : order.node.shop.name }</div>
                </div>
                <div class="row mb-1">
                    <div class="col">Phone No : </div>
                    <div class="col"><a href={"tel:"+order.node.shop.phoneNo}><i class="fas fa-phone-alt"></i>{order.node.isShop ? order.node.buyer.phoneNo : order.node.shop.phoneNo }</a></div>
                </div>
                <div class="row mb-1">
                    <div class="col">Payment Mode : </div>
                    <div class="col">{order.node.transactionDetails.paymentType}</div>
                </div>
                <div class="row mb-1 ">
                    <div class="col">Payment Status : </div>
                    <div class="col">{order.node.transactionDetails.status}</div>
                </div>
                {order.node.isPreorder ? 
                <div class="row mb-1">
                    <div class="col">Preodered Time : </div>
                    <div class="col">{order.node.preorderScheduledTime}</div>
                </div>:<span></span>
                }
                {order.node.data.map((item, index)=>{
                    return <div class="row border-top p-1">
                        <div class="col"> 
                            <img src={ENDPOINT+"/media/"+item["product_picture"]} alt="" class="img-fluid rounded-circle mx-auto d-block" style={{width: "3rem", height: "3rem"}}/>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center p-1">{item["product_name"]}</div>
                        <div class="col txt-green d-flex align-items-center justify-content-center p-1">{item["quantity"]}x &#8377;{item["price_per_unit"]}</div>
                    </div>
                })}

                


                <div class="row text-danger border-top py-3">
                    <div class="col fw-bold text-uppercase text-start">Total : </div>
                    <div class="col text-end fw-bold">&#8377; {order.node.price}</div>
                </div>

                <div class="row border-top pt-3">
                    <div class="col fw-bold text-danger">Status : </div>
                    <div class="col fst-italic">{order.node.orderStatus}</div>
                </div>
                { isShop == "true" && order.node.orderStatus != "COMPLETED" ?              
                <div class="btn-group mx-3 mt-3" role="group" aria-label="Basic outlined example">
                    <button type="button" class="btn btn-dark open_sans fw-bold" onClick={()=>{updateOrderStatus(index,order.node.objId , "processing")}} >Process</button>
                    <button type="button" class="btn btn-warning open_sans fw-bold" onClick={()=>{updateOrderStatus(index,order.node.objId , "completed")}}>Deliver</button>
                    <button type="button" class="btn btn-danger open_sans fw-bold" onClick={()=>{updateOrderStatus(index,order.node.objId , "cancelled")}}>Cancel</button>
                </div> 
                : <span></span>}

            </div>
        </div>
        </>)    
            })}
        </div>
        {/* {isShop == "true" ? <p>shop</p> : <p>buyer</p> } */}
    </>)
}

export default OrderLog;