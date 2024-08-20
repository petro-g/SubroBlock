import React from "react";
import "./index.css";
import Actions from "./actions";
import Header from "./header";

export default function ActionQeue() {
  return (
    <div className="h-screen bg-gray-100 p-3" >
      <Header />
      <Actions />
    </div>
  );
}