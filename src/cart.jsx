import React , {useEffect, useState} from 'react';
import { removeFromCart, updateQuantityCart, getAllProductsFromCart} from './shopping_function';
import { GRAPHQL_ENDPOINT, ENDPOINT } from './config';
import axios from 'axios';
import useRazorpay,  { RazorpayOptions } from "react-razorpay";
import {getBalanceByAddress, sendINR, decryptMnemonicWithPasscode, retrieveAccountDetailsFromMnemonic} from './celo_functions';
import BigNumber from "bignumber.js";


const Cart = ()=>{


    const [products, setProducts] = useState([]);
    const [isPreorder, setIsPreorder] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const Razorpay = useRazorpay();
    var paymentType = "cash";
    var scheduledTime = (new Date()).toISOString();

    // "objId"
    // "name" 
    // "picture" 
    // "price"
    // "shop" 
    // "shopObjId" 
    // "quantity" 

    useEffect(()=>{
        getAllProductsFromCart().then(data=>{
            setProducts(data);
            calulateTotal();
        })  
    },[])

    const calulateTotal = ()=>{
        let tmpPrice = 0;
        products.forEach(product=>{
            tmpPrice += product.price * product.quantity;
        })
        setTotalPrice(tmpPrice);
    }

    const removeProduct = (index)=>{
        removeFromCart(products[index].shopObjId,products[index].objId); 
        setProducts(products.filter(e => e.objId != products[index].objId));
        calulateTotal();
    }

    const incrementProductQuantity = (index)=>{
        var tmp = products;
        tmp[index].quantity = tmp[index].quantity + 1;
        updateQuantityCart(tmp[index].shopObjId, tmp[index].objId, tmp[index].quantity);
        setProducts([...tmp]);
        calulateTotal();
    }

    const decrementProductQuantity = (index)=>{
        var tmp = products;
        if(tmp[index].quantity == 1){
            removeProduct(index);
            return;
        }
        tmp[index].quantity = tmp[index].quantity - 1;
        updateQuantityCart(tmp[index].shopObjId, tmp[index].objId, tmp[index].quantity);
        setProducts([...tmp]);
        calulateTotal();
    }

    const checkout = async()=>{
        var cartDetailsJSON = JSON.parse(localStorage.getItem("cart")) ?? {};
        if(isPreorder && scheduledTime == "") return
            const token = localStorage.getItem('token');

            const dataToBeSubmit = {
                "cartData" : cartDetailsJSON,
                "isPreorder" : isPreorder,
                "paymentType" : paymentType,
                "scheduledTime" : scheduledTime ?? "" 
            }
    
            var data = JSON.stringify({
                query: `mutation($cartData:GenericScalar!, $isPreorder:Boolean!, $paymentType:String!, $scheduledTime:DateTime!){
                placeOrder(cartData : $cartData, isPreorder : $isPreorder, paymentType : $paymentType, scheduledTime : $scheduledTime){
                  success
                  message
                  orderPlaced
                  totalPrice
                  paymentType
                  transactionIds
                  redirectPaymentPage
                  prices
                  cryptoAddresses
                }
              }`,
                variables: dataToBeSubmit
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
            console.log(response.data.data.placeOrder);
            if (response.data == undefined){
                return {};
            };


            if(response.data.data.placeOrder.success){
                console.log(response.data.data.placeOrder.paymentType)
                if(response.data.data.placeOrder.paymentType === "online"){
                    const options = {
                        key: "rzp_test_YYYJHE9VNyqobl", // Enter the Key ID generated from the Dashboard
                        amount: response.data.data.placeOrder.totalPrice*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                        currency: "INR",
                        name: "",
                        description: "Test Transaction",
                        // image: "https://example.com/your_logo",
                        handler: function (response) {
                            window.location.href = `${ENDPOINT}/api/verify/orderpayment/${response.razorpay_payment_id}/`
                        },
                        prefill: {
                          name: "",
                          contact: "",
                        },
                        notes: {
                            "TYPE" : "ORDERPAYMENT",
                            "TRANSACTIONS" : JSON.stringify(response.data.data.placeOrder.transactionIds)
                        },
                        theme: {
                          color: "#3399cc",
                        },
                      };
                    
                      const rzp1 = new Razorpay(options);
                      rzp1.on("payment.failed", function (response) {
                        alert(response.error.description);
                      });
                      rzp1.open();
                }

                if(response.data.data.placeOrder.paymentType === "cash"){
                    console.log("Successful payment")
                }

                if(response.data.data.placeOrder.paymentType === "virtualwallet"){
                    console.log("success")
                    var data = JSON.stringify({
                        query: `mutation($transactionIds : [String]!, $transactionHash : String){
                        processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
                          totalTransactions
                          successfulTransactions
                          details
                        }
                      }`,
                        variables: {"transactionIds": response.data.data.placeOrder.transactionIds}
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
                    // console.log(response)
                    if (response.data == undefined){
                        return {};
                    };
                    if(response.data.data.processTransaction.totalTransactions != response.data.data.processTransaction.successfulTransactions){
                        response.data.data.processTransaction.details.forEach((trx)=>{
                            if(!trx["success"]){
                                console.log("hit")
                                alert(trx["error"])
                            }
                        })
                    }else{
                        console.log("Successful payment")
                    }

                }

                if(response.data.data.placeOrder.paymentType === "crypto"){
                    console.log(response.data.data.placeOrder.prices)
                    var passcode = "";
                    var decryptedMnemonic;
                    let trasactionHashes = [];
                    while (passcode == "" || passcode == null) {
                        passcode = prompt("Enter your passcode ")
                        try{
                            if(passcode != ""){
                                decryptedMnemonic = await decryptMnemonicWithPasscode(localStorage.getItem("celoEncryptedMnemonic"),passcode);
                                console.log(decryptedMnemonic);
                            }
                        }catch{
                            console.log("Failed");
                            console.log(passcode);
                            passcode = "";
                        }
                    } 
                    try {
                        const accountDetails = await retrieveAccountDetailsFromMnemonic(decryptedMnemonic);
                        // TODO Check total price with balance
                        for (let i = 0; i < response.data.data.placeOrder.prices.length; i++) {
                            const price = response.data.data.placeOrder.prices[i];
                            const address = response.data.data.placeOrder.cryptoAddresses[i];
                            var transactionReceipt = await sendINR(accountDetails.address,accountDetails.privateKey, address, price);
                            console.log(JSON.stringify(transactionReceipt));
                            if(!transactionReceipt.status){
                                alert("Transaction Failed");
                                break;
                            }
                            trasactionHashes.push(transactionReceipt.transactionHash)
                        }


                        console.log();

                        var data = JSON.stringify({
                            query: `mutation($transactionIds : [String]!, $transactionHash : [String]!){
                            processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
                              totalTransactions
                              successfulTransactions
                              details
                            }
                          }`,
                            variables: {
                                "transactionIds": response.data.data.placeOrder.transactionIds,
                                "transactionHash" : trasactionHashes
                            }
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

                        // console.log(response);
                    
                        var response = await axios(config);
                        console.log(response)
                        if (response.data == undefined){
                            return {};
                        };
                        if(response.data.data.processTransaction.totalTransactions != response.data.data.processTransaction.successfulTransactions){
                            response.data.data.processTransaction.details.forEach((trx)=>{
                                if(!trx["success"]){
                                    console.log("hit")
                                    alert(trx["error"])
                                }
                            })
                        }else{
                            console.log("Successful payment")
                        }

                    } catch (error) {
                        passcode = ""
                    }
                }
            }


    }



    return (
        <>
        <h1>Hello This a Cart page</h1>
        <h3>total price : {totalPrice}</h3>
        <hr></hr>
        {products.length == 0 ? <h2>Please add some product first</h2> :
        products.map((product, index) =>{
            return <div key={index}>
                <h3>Name : {product.name}</h3>
                <h4>Price : {product.price}</h4>
                <h4>Shop Name : {product.shop}</h4>
                <h4>Quantity : {product.quantity}</h4>
                <button onClick={()=>{incrementProductQuantity(index)}}>Increase</button>
                <button onClick={()=>{decrementProductQuantity(index)}}>Decrease</button>
                <button onClick={()=>{removeProduct(index)}}>Remove from Cart</button>
            </div>
        })}

        <hr></hr>
        <select onChange={(data)=>paymentType=data.target.value} defaultValue="cash">
            <option value="cash" >Cash</option>
            <option value="virtualwallet">Virtual Wallet</option>
            <option value="online">Online</option>
            <option value="crypto">Crypto</option>
        </select><br></br>
        <select value={isPreorder ? 1 : 0} onChange={(data)=>setIsPreorder(data.target.value==1)}>
            <option value={1} >Yes</option>
            <option value={0} >No</option>
        </select><br></br>

        {isPreorder ? <input  type="datetime-local" value={scheduledTime} onChange={(data)=>scheduledTime = data.target.value.toString()}/> :  <span></span>}
        <br></br>
        <button onClick={checkout}>Checkout</button>
        </>
    );
}

export default Cart;                          