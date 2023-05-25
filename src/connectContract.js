// src/connectContract.js
import { ethers } from "ethers";
import PaymentEscrow from "./PaymentEscrow.json";

export const connectContract = async (contractAddress) => {
  // Check if the MetaMask extension is installed and connected
  if (typeof window.ethereum === "undefined") {
    alert(
      "MetaMask extension is not installed. Please install it and try again."
    );
    return;
  }

  // Request permission to access the user's Ethereum account
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Create an instance of ethers.js connected to the user's Ethereum account
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // Create an instance of the PaymentEscrow contract
  const paymentEscrowContract = new ethers.Contract(
    contractAddress,
    PaymentEscrow.abi,
    signer
  );

  return paymentEscrowContract;
};
