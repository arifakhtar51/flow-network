import React from 'react';
import { Link } from "react-router-dom";

function Nav({ checkTronLink, connected, walletAddress, disconnectWallet }) {
  console.log(connected, walletAddress)

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Ignitus Networks</span>
          </a>
          
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {connected ? (
              <div className="flex items-center space-x-2">
                <button 
                  type="button" 
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" 
                  onClick={checkTronLink}
                  disabled={connected}>
                  {walletAddress}
                </button>
                <button 
                  type="button" 
                  className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" 
                  onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
                onClick={checkTronLink}>
                Connect Wallet
              </button>
            )}
          </div>

          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <Link 
                  className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" 
                  aria-current="page" 
                  to="/">NFTs</Link>
              </li>
              {/* <li>
                <Link 
                  className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" 
                  aria-current="page" 
                  to="/closed">Closed Campaigns</Link>
              </li> */}
              <li>
                <Link 
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700" 
                  to="/create">Create</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Nav;