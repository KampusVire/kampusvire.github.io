import React , {useState} from 'react';
import { GRAPHQL_ENDPOINT } from './config';
import axios from 'axios';
import { Link } from 'react-router-dom';




const AllShops = ()=>{
    const [shops, setShops] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const token = localStorage.getItem('token');


    if(!loaded){
        var data = JSON.stringify({
            query: `query{
            allShops{
              edges{
                node{
                  id
                  objId
                  name
                  type
                  longitudeCoordinate
                  latitudeCoordinate
                  picture
                  operatingDays
                  openAt
                  closeAt
                  phoneNo
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
          
          axios(config)
          .then(function (response) {
                setLoaded(true);
              response.data.data.allShops.edges.forEach(shop=>{
                  console.log(shop.node);
                  setShops([...shops, shop.node]);
              })
          })
          .catch(function (error) {
            console.log(error);
          });
    }

    return (
        <>
            <h1>Hello This a AllShops page</h1>

            {shops.map(shop=>{
                return <div>
                    <h2>{shop.name}</h2>
                    <h3>{shop.type}</h3>
                    <h3>{shop.objId}</h3>
                    <Link to={"/shop/"+shop.objId}>See {shop.name}</Link>
                </div>
            })}
        </>
    );
}

export default AllShops;