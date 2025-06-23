import { useEffect, useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { PinataSDK } from "pinata-web3";
import "../App.css";
import jws from "../contracts/pinata.json";

const pinata = new PinataSDK({
  pinataJwt: jws.jws,
  pinataGateway: "beige-sophisticated-baboon-74.mypinata.cloud",
})

// Flow EVM Testnet chain ID
const FLOW_EVM_TESTNET_CHAIN_IDS = ['0x221', '545'];
const FLOW_EVM_TESTNET_NAME = 'Flow EVM Testnet';

const Create = ({ contract }) => {
  const [processing, setProcessing] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [formInfo, setFormInfo] = useState({
    title: "",
    description: "",
    price: 0,
    imageHash: "" 
  });

  useEffect(() => {
    checkNetwork();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, []);

  const checkNetwork = async () => {
    if (!window.ethereum) {
      setIsCorrectNetwork(false);
      return;
    }
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // Accept both hex and decimal representations
      const isFlowEVMNetwork = FLOW_EVM_TESTNET_CHAIN_IDS.includes(chainId) || FLOW_EVM_TESTNET_CHAIN_IDS.includes(parseInt(chainId, 16).toString());
      setIsCorrectNetwork(isFlowEVMNetwork);
    } catch (error) {
      setIsCorrectNetwork(false);
    }
  };

  const switchToFlowEVMNetwork = async () => {
    if (!window.ethereum) {
      toast.error('No Ethereum provider found. Please install MetaMask or another wallet.', { position: "top-center" });
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x221' }],
      });
      toast.success('Successfully switched to Flow EVM Testnet!', { position: "top-center" });
      await checkNetwork();
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x221',
              chainName: 'Flow EVM Testnet',
              nativeCurrency: {
                name: 'FLOW',
                symbol: 'FLOW',
                decimals: 18
              },
              rpcUrls: ['https://evm.testnet.flowchain.dev'],
              blockExplorerUrls: ['https://testnet.flowscan.org']
            }]
          });
          toast.success('Flow EVM Testnet added and switched successfully!', { position: "top-center" });
          await checkNetwork();
        } catch (addError) {
          toast.error('Failed to add Flow EVM Testnet. Please add it manually to your wallet.', { position: "top-center" });
        }
      } else {
        toast.error('Failed to switch to Flow EVM Testnet. Please switch manually.', { position: "top-center" });
      }
    }
  };

  const ensureNetworkStability = async () => {
    const initialChainId = await window.ethereum.request({ method: 'eth_chainId' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    return initialChainId === '0x221' && currentChainId === '0x221';
  };

  useEffect(() => {
    document.title = "Create NFT";
  }, []);

  const handleChange = (event) => {
    let { name, value } = event.target;
    setFormInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      const response = await pinata.upload.file(file);
      setFormInfo((prevState) => ({
        ...prevState,
        imageHash: `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${response.IpfsHash}`,
      }));
      // toast.success('Image uploaded successfully', { position: "top-center" });

    } catch (error) {
      console.error("Image upload failed", error);
      toast.error('Failed to upload image', { position: "top-center" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formInfo.price <= 0) {
      toast.error('Price must be greater than 0', { position: "top-center" });
      return;
    }

    if (!formInfo.imageHash) {
      toast.error('Please upload an image', { position: "top-center" });
      return;
    }

    if (!formInfo.title.trim()) {
      toast.error('Please enter a title', { position: "top-center" });
      return;
    }

    if (!formInfo.description.trim()) {
      toast.error('Please enter a description', { position: "top-center" });
      return;
    }

    setProcessing(true);

    try {
      // Re-check network before proceeding
      await checkNetwork();
      
      if (!isCorrectNetwork) {
        throw new Error("Please connect to Flow EVM Testnet before minting.");
      }

      // Ensure network stability before proceeding
      const isNetworkStable = await ensureNetworkStability();
      if (!isNetworkStable) {
        throw new Error("Network is not stable. Please ensure you're on Flow EVM Testnet.");
      }

      if (!contract) {
        throw new Error("Contract not initialized. Please connect your wallet.");
      }

      console.log("Form data:", formInfo);
      console.log("Contract address:", contract.address);

      // Verify we're using the correct contract address
      const expectedAddress = "0xec8a14c5ddc18c63c4da7d46893fa7d39aefd459";
      if (contract.address.toLowerCase() !== expectedAddress.toLowerCase()) {
        console.warn("Contract address mismatch. Expected:", expectedAddress, "Got:", contract.address);
        toast.warning("Contract address mismatch detected. Please refresh the page and try again.", { position: "top-center" });
        return;
      }

      const priceInWei = ethers.utils.parseEther(formInfo.price.toString());
      console.log("Price in Wei:", priceInWei.toString());

      // Check if we have a signer
      const signer = contract.signer;
      if (!signer) {
        throw new Error("No signer found. Please connect your wallet.");
      }

      // Set a future deadline (1 year from now) since the contract requires it
      const futureDeadline = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      console.log("Creating NFT with parameters:", {
        title: formInfo.title,
        description: formInfo.description,
        target: priceInWei.toString(),
        deadline: futureDeadline,
        image: formInfo.imageHash
      });

      // Use the existing createCampaign function but treat it as NFT minting
      const tx = await contract.createCampaign(
        formInfo.title,
        formInfo.description,
        priceInWei,
        futureDeadline,
        formInfo.imageHash
      );
      
      console.log("Transaction sent:", tx.hash);
      toast.info("Transaction sent! Waiting for confirmation...", { position: "top-center" });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      toast.success("NFT minted successfully!", { position: "top-center" });
      
      // Reset form
      setFormInfo({
        title: "",
        description: "",
        price: 0,
        imageHash: ""
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      let errorMessage = "Failed to mint NFT: ";
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += "Insufficient funds to mint NFT";
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage += "Transaction would fail. Please check your input values";
      } else if (error.message.includes("user rejected")) {
        errorMessage += "Transaction was rejected by user";
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes("underlying network changed")) {
        errorMessage = "Network error detected. Please ensure you're connected to Flow EVM Testnet and try again.";
        toast.error(errorMessage, { position: "top-center" });
        // Re-check network status
        await checkNetwork();
        return;
      } else {
        errorMessage += error.message;
      }
      
      if (!errorMessage.includes("Network error detected")) {
        errorMessage = " Please Connect to Flow EVM Wallet.";
        toast.error(errorMessage, { position: "top-center" });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-800 to-gray-900">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Mint NFT</h2>
          
          {!isCorrectNetwork && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading>Please Connect to Flow EVM Testnet</Alert.Heading>
              <p>
                This application requires the Flow EVM Testnet to function. Please switch your network to Flow EVM Testnet to mint NFTs.
              </p>
              <Button onClick={switchToFlowEVMNetwork} variant="primary">Switch to Flow EVM Testnet</Button>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Upload Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
                disabled={!isCorrectNetwork}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Title</Form.Label>
              <Form.Control
                onChange={handleChange}
                name="title"
                required
                type="text"
                placeholder="NFT Title"
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
                disabled={!isCorrectNetwork}
                value={formInfo.title}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Description</Form.Label>
              <Form.Control
                onChange={handleChange}
                name="description"
                required
                as="textarea"
                rows={3}
                placeholder="NFT Description"
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
                disabled={!isCorrectNetwork}
                value={formInfo.description}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-white">Price (FLOW)</Form.Label>
              <Form.Control
                onChange={handleChange}
                name="price"
                required
                type="number"
                step="0.01"
                placeholder="NFT Price in FLOW"
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
                disabled={!isCorrectNetwork}
                value={formInfo.price}
              />
            </Form.Group>

            {formInfo.imageHash && (
              <div className="mb-4">
                <Form.Label className="text-white">Preview</Form.Label>
                <div className="mt-2">
                  <img 
                    src={formInfo.imageHash} 
                    alt="NFT Preview" 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={processing || !isCorrectNetwork}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
              >
                {processing ? 'Minting...' : 'Mint NFT'}
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}

export default Create;
