"use client";
import React from 'react'

const Header = () => {
  return (
    <>
      <div className=" flex flex-col justify-center items-center bg-gradient-to-r from-gray-800 to-gray-900">
        <header className="text-white text-center text-3xl font-bold p-2 flex flex-col items-center justify-around w-full gap-4">
          {/* Added flex items-center */}
          <h3>Nepal Voucher Processor</h3>
          {/* Conditionally render myValue */}
          <p className="text-white text-sm font-bold pb-2">
            Enter date range and process entries
          </p>
        </header>
      </div>
    </>
  );
}

export default Header