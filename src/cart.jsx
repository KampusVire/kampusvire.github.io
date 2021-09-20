import React , {useEffect, useState} from 'react';
import { removeFromCart, updateQuantityCart, getAllProductsFromCart} from './shopping_function';
import { GRAPHQL_ENDPOINT } from './config';
import axios from 'axios';

const Cart = ()=>{


    const [products, setProducts] = useState([]);
    const [isPreorder, setIsPreorder] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
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
            console.log(response);
            if (response.data == undefined){
                return {};
            };
            console.log(response.data);



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