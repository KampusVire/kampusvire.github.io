import React from "react";
import { Link } from "react-router-dom";
import "./components/fail.css";

const ErrorPage = () => {
  return (
    <>
      <div id="orderconfirmation">
        <div id="balloon">
          <div class="failballoon"></div>
          <div class="failbasket"></div>
          <div class="cloud"></div>
        </div>
      </div>
      <div class="container rubik text-danger">
        <div class="text-uppercase fs-1 text-center">
          <i class="fas fa-times-circle"  style={{fontSize : "6rem"}}></i>
          <br />
          <p class="mt-3">Your request has been failed</p>
        </div>
      </div>
      <div class="d-grid gap-2 d-md-block container button mt-5">
        <Link
        to="/"
          class="btn btn-danger nunito_sans fw-bold text-uppercase"
          type="button"
        >
          Back to home
        </Link>
      </div>{" "}
    </>
  );
};

export default ErrorPage;
