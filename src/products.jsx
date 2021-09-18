import React , {useState} from 'react';
import {useParams} from 'react-router-dom';

const AllProducts = ()=>{
    const {shopid} = useParams();
    const [products, setProducts] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const token = localStorage.getItem('token');


    return (
        <h1>Hello This a AllProducts page of shop {shopid}</h1>
        
    );
}

export default AllProducts;