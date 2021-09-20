import React , {useEffect, useState} from 'react';
import { removeFromCart, updateQuantityCart, getAllProductsFromCart} from './shopping_function';

const Cart = ()=>{


    const [products, setProducts] = useState([]);

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
        })  
    },[])

    const removeProduct = (index)=>{
        removeFromCart(products[index].shopObjId,products[index].objId); 
        setProducts(products.filter(e => e.objId != products[index].objId))
    }

    const incrementProductQuantity = (index)=>{
        var tmp = products;
        tmp[index].quantity = tmp[index].quantity + 1;
        updateQuantityCart(tmp[index].shopObjId, tmp[index].objId, tmp[index].quantity);
        setProducts([...tmp]);
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
    }



    return (
        <>
        <h1>Hello This a Cart page</h1>
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
        })
        }
        </>
    );
}

export default Cart;                          