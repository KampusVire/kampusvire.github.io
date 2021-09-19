import React , {useState} from 'react';
import {useParams} from 'react-router-dom';
import { ENDPOINT, GRAPHQL_ENDPOINT } from './config';
import axios from 'axios';

const AllProducts = ()=>{
    const {shopid} = useParams();
    const [products, setProducts] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const token = localStorage.getItem('token');

    if(!loaded){
        var data = JSON.stringify({
            query: `query($shopId : Int!){
            allProducts(shopId : $shopId){
              pageInfo{
                startCursor
                endCursor
                hasPreviousPage
                hasNextPage
              }
              edges{
                cursor
                node{
                  id
                  objId
                  name
                  picture
                  price
                  isAvailable
                }
              }
            }
          }`,
            variables: {"shopId":shopid}
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

          axios(config)
          .then(function (response) {
                setLoaded(true);
                let tmpData = [];
                response.data.data.allProducts.edges.forEach(function(edge){
                    tmpData.push({
                        objId: edge.node.objId,
                        name: edge.node.name,
                        picture: edge.node.picture,
                        price: edge.node.price,
                        isAvailable: edge.node.isAvailable
                    });           
                    console.log(tmpData);                          
                });
                setProducts([...products, ...tmpData]);
        })      
          .catch(function (error) {
            console.log(error);
          });
    }


    return (
        <>
        <h1>Hello This a AllProducts page of shop {shopid}</h1>
        {products.map(product=>{
                return <div key={product.objId}>
                    <h2>{product.name}</h2>
                    <h3>{product.price}</h3>
                    <h3>{product.objId}</h3>
                    <img src={ENDPOINT + "/media/"+product.picture}></img>
                </div>
            })}
        </>
    );
}

export default AllProducts;