import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ENDPOINT, GRAPHQL_ENDPOINT } from "./config";
import axios from "axios";
import { addToCart } from "./shopping_function";
import "./components/canteen.css";
import canteenImage from "./components/img/Rectangle 100 (1).png";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllProducts = (props) => {
  const { shopid } = useParams();
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const token = localStorage.getItem("token");

  if (!loaded) {
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
      variables: { shopId: shopid },
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

    axios(config)
      .then(function (response) {
        setLoaded(true);
        let tmpData = [];
        response.data.data.allProducts.edges.forEach(function (edge) {
          tmpData.push({
            objId: edge.node.objId,
            name: edge.node.name,
            picture: edge.node.picture,
            price: edge.node.price,
            isAvailable: edge.node.isAvailable,
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
      <div
        className="container-fluid sticky-top p-0 m-0 mb-4 w-100"
        style={{ height: "162px" }}
      >
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <img src={canteenImage} className="img-fluid w-100 h-100" />
        <div className="container-fluid p-0 m-0 topBg text-light nunito_sans fs-1 d-flex flex-column-reverse align-items-center">
          <div className="position-absolute top-0 d-flex w-100 justify-content-between p-2 fs-4">
            <a  onClick={()=>props.history.goBack()}><i className="fas fa-arrow-left"></i></a>
            <h3 className="fw-bold nunito_sans text-uppercase text-center d-inline pt-2">
              menu
            </h3>
            <i className="fas fa-map-marker-alt text-warning"></i>
          </div>
          <div
            className="d-flex justify-content-between align-items-center w-50 mb-1"
            style={{ fontSize: "1rem" }}
          >
            <small className="open_sans">Closes in 8pm</small>
            <small className="open_sans fw-bold text-danger">Busy</small>
          </div>
          <div className="text-center w-75 lh-1">Canteen 1</div>
        </div>
      </div>

      <div className="container px-3 mt-3 d-flex flex-wrap justify-content-around">
        {products.map((product) => {
          return (
            <div
              className="card  m-1 p-0 bg-light"
              style={{ width: "47%" }}
              key={product.objId}
            >
              <img
                src={ENDPOINT + "/media/" + product.picture}
                className="card-img-top"
              />
              <div className="card-body p-1">
                <h6 className="card-title text-center open_sans fw-bold m-2 text-capitalize">
                  {product.name}
                </h6>
                {/* <small className="card-text text-muted text-center d-block">Preparation time : 25min</small><br /> */}
                <small className="card-text text-center d-block">
                  Cost: <b className="text-danger"> &#8377;{product.price}</b>
                </small>
                <br />
                <div className="d-grid">
                  <button
                    className="btn bg-green fs-6 text-light mb-2 mx-2 fw-bold rubik rounded-pill d-block food"
                    onClick={() => {
                      addToCart(shopid, product.objId);
                      toast.success("Added in cart", {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                      });
                    }}
                  >
                    Order here
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AllProducts;
