import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Create from './components/Create.jsx';
import Home from './components/Home.jsx';
import Closed from './components/Closed.jsx';
import contractData from './contracts/contractData.json';
import Nav from './components/Nav.jsx';
import { ethers } from 'ethers';

function App() {
  const [contract, setContract] = useState(null);
  
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [networkCorrect, setNetworkCorrect] = useState(true);
  const FLOW_EVM_CHAIN_ID = '0x221'; // 545 in hex

  const disconnectWallet = () => {
    setWalletAddress(null);
    setContract(null);
    setConnected(false);
    toast.info("Wallet disconnected", {
      position: "top-center",
    });
  };

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await initiateContract();
          setWalletAddress(accounts[0]);
          setConnected(true);
          console.log("connected to wallet:", accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        toast.error("Error connecting to wallet: " + error.message, {
          position: "top-center",
        });
      }
    }
  };

  const onConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          toast.success("Wallet connected successfully!", {
            position: "top-center",
          });
          await initiateContract();
          setConnected(true);
        }
      } catch (error) {
        console.error("Connection error:", error);
        toast.error("Failed to connect wallet: " + error.message, {
          position: "top-center",
        });
      }
    } else {
      toast.error("Please install MetaMask or another Ethereum wallet", {
        position: "top-center",
      });
    }
  };

  const initiateContract = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum provider found");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractData.address,
        contractData.abi,
        signer
      );
      
      console.log("Contract initialized:", contract);
      setContract(contract);
    } catch (error) {
      console.error("Error initializing contract:", error);
      toast.error("Error initializing contract: " + error.message, {
        position: "top-center",
      });
    }
  };

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== FLOW_EVM_CHAIN_ID) {
        setNetworkCorrect(false);
        toast.error('Please connect to Flow EVM Testnet (ChainID 545)', { position: 'top-center' });
      } else {
        setNetworkCorrect(true);
      }
    }
  };

  useEffect(() => {
    checkWalletConnection();
    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await initiateContract();
        } else {
          setWalletAddress(null);
          setContract(null);
          setConnected(false);
        }
      });
      window.ethereum.on('chainChanged', async (chainId) => {
        await checkNetwork();
        if (chainId !== FLOW_EVM_CHAIN_ID) {
          setContract(null);
          setConnected(false);
        } else {
          await initiateContract();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <div className="App font-jersey-25">
        <div className="gradient-bg-welcome">
          <Nav 
            checkTronLink={onConnect} 
            connected={connected} 
            walletAddress={walletAddress} 
            disconnectWallet={disconnectWallet}
          />
          {!networkCorrect ? (
            <div className='text-white flex items-center justify-center mt-10'>
              Please connect to Flow EVM Testnet (ChainID 545, FLOW)
            </div>
          ) : !contract ? (
            <div className='text-white flex items-center justify-center'>Loading...</div>
          ) : (
            <Routes>
              <Route
                path='/create'
                element={<Create contract={contract} />}
              />
              <Route
                path='/'
                element={<Home contract={contract} />}
              />
              <Route
                path='/closed'
                element={<Closed contract={contract} />}
              />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;