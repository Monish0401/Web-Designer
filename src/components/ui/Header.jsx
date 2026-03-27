// 

import React from "react";
// import "../../App.css";

const Header = ({ theme }) => {
  return (
    <div
      style={{
        display: "flex",
        // CSS properties in style objects must use camelCase
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
      }}
    >
      {/* First <img> tag correction: style object must be wrapped in curly braces {} */}
      <img
        style={{
          height: "85px",
          width: "85px",
          objectFit: "contain", // Use camelCase
        }}
        src="Space_Applications_Centre_logo.png"
        alt="SAC Logo"
      />
      {/* theme variable must be available, assuming it's passed as a prop */}
      <h1 style={{fontSize: "1.75rem", fontWeight: "600"}} className={`mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        Software Defined Radio(SDR) Payload Commanding User Inteface
      </h1>
      {/* Second <img> tag correction: style object must be wrapped in curly braces {} 
          and the property 'style' must be present. */}
      <img
        style={{
          height: "50px",
          width: "50px",
          objectFit: "contain", // Use camelCase
        }}
        src="Indian_Space_Research_Organisation_Logo.svg.png"
        alt="ISRO Logo"
      />
    </div>
  );
};

export default Header;
