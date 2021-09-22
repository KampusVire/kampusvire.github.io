import React from "react";
import "./components/confirm.css";
import { Link } from "react-router-dom";

const SuccessPage = () => {
  return (
    <>
      <div id="orderconfirmation">
        <div id="balloon">
          <div class="balloon"></div>
          <div class="basket"></div>
          <div class="cloud"></div>
        </div>
      </div>
      <div class="container rubik txt-green">
        <div class="text-uppercase fs-1 text-center">
          <i class="far fa-check-circle"></i>
          <br />
          <p class="mt-3">Your request has been processed</p>
        </div>
      </div>
      <div class="d-grid gap-2 d-md-block container button mt-5">
        <Link
        to="/"
          class="btn btn-success bg-green nunito_sans fw-bold text-uppercase"
          type="button"
        >
          Back to home
        </Link>
      </div>{" "}
    </>
  );
};

export default SuccessPage;
