import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { InjectedConnector } from "@web3-react/injected-connector";
import PaymentEscrow from "./PaymentEscrow.json";

const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 11155111],
});

const FinancierInteraction = () => {
  const { activate, account, library } = useWeb3React();
  const [connected, setConnected] = useState(false);
  const [agreementId, setAgreementId] = useState("");
  const [escrowData, setEscrowData] = useState({});
  const [paymentData, setPaymentData] = useState({});

  useEffect(() => {
    if (account && library) {
      setConnected(true);
    } else {
      setConnected(false);
    }
  }, [account, library]);

  const handleGetAgreementData = async () => {
    if (!library || !account) {
      alert("Please connect your wallet");
      return;
    }

    if (!agreementId) {
      alert("Please enter an agreement ID");
      return;
    }

    const contractAddress = "0x3e2bB50B0F01aC9576948bAA786e1c864C3b5d22";
    const contract = new ethers.Contract(
      contractAddress,
      PaymentEscrow.abi,
      library.getSigner(account)
    );

    try {
      const escrowData = await contract.escrows(agreementId);
      const paymentData = await contract.payments(agreementId);

      if (escrowData.bigMoney !== account) {
        alert(
          "To view this page, you must connect with the wallet that was used to finance this agreement."
        );
        return;
      }

      setEscrowData(escrowData);
      setPaymentData(paymentData);

      // Call checkDelinquency
      await contract.checkDelinquency(agreementId);
    } catch (error) {
      console.error("Failed to fetch agreement data:", error);
    }
  };

  const handleTerminateAgreement = async () => {
    if (!library || !account) {
      alert("Please connect your wallet");
      return;
    }

    if (!agreementId) {
      alert("Please enter an agreement ID");
      return;
    }

    const contractAddress = "0xdfF1e4981C4ED44Da3814660dEC5D77174A790A3";
    const contract = new ethers.Contract(
      contractAddress,
      PaymentEscrow.abi,
      library.getSigner(account)
    );

    try {
      const tx = await contract.terminateAgreement(agreementId);
      await tx.wait();
      alert("Agreement terminated successfully");
      handleGetAgreementData(); // Refresh the displayed data
    } catch (error) {
      console.error("Failed to terminate agreement:", error);
      alert("Agreement termination failed");
    }
  };
  return (
    <div>
      {!connected && (
        <div>
          <p>
            Please connect to the wallet with which you are financing the
            agreement you'd like to access.
          </p>
          <button onClick={() => activate(injectedConnector)}>Connect</button>
        </div>
      )}
      {connected && (
        <div>
          <h2>Connected Address: {account}</h2>
          <label>Enter the Agreement ID:</label>
          <input
            type="number"
            value={agreementId}
            onChange={(e) => setAgreementId(e.target.value)}
          />
          <button onClick={handleGetAgreementData}>Submit</button>
          {Object.keys(escrowData).length > 0 &&
            Object.keys(paymentData).length > 0 && (
              <div className="grid-container">
                <div className="grid-item">
                  <strong>Escrow Data</strong>
                  <p>
                    <strong>Client:</strong> {escrowData.wagie}
                  </p>
                  <p>
                    <strong>Financier:</strong> {escrowData.bigMoney}
                  </p>
                  <p>
                    <strong>Token:</strong> {escrowData.tokenAddress}
                  </p>
                  <p>
                    <strong>Amount in Escrow:</strong>{" "}
                    {ethers.utils.formatEther(escrowData.amount.toString())}
                  </p>
                  <p>
                    <strong>Current Security Deposit in Escrow:</strong>{" "}
                    {ethers.utils.formatEther(
                      escrowData.securityDepositAmount.toString()
                    )}
                  </p>
                  <p>
                    <strong>Value at Deposit Time (WEI):</strong>{" "}
                    {escrowData.totalDepositValueWei.toString()}
                  </p>
                </div>
                <div className="grid-item">
                  <strong>Payment Data</strong>
                  <p>
                    <strong>Total payments due:</strong>{" "}
                    {paymentData.numberOfPayments.toString()}
                  </p>
                  <p>
                    <strong>Payments Made:</strong>{" "}
                    {paymentData.paymentsMade.toString()}
                  </p>
                  <p>
                    <strong>Established Rate:</strong>{" "}
                    {paymentData.premiumRate.toString()}
                  </p>
                  <p>
                    <strong>Security Deposit Rate:</strong>{" "}
                    {paymentData.securityDepositRate.toString()}
                  </p>
                  <p>
                    <strong>Next Payment Due:</strong>{" "}
                    {new Date(
                      paymentData.nextPaymentDue * 1000
                    ).toLocaleString()}
                  </p>
                  <p>
                    <strong>Current Standing:</strong>{" "}
                    {paymentData.delinquent ? "Payment is Delinquent" : "Good"}
                  </p>
                </div>
              </div>
            )}
          {Object.keys(escrowData).length > 0 &&
            Object.keys(paymentData).length > 0 &&
            paymentData.paymentsMade < paymentData.numberOfPayments && (
              <button onClick={handleTerminateAgreement}>
                Terminate Agreement
              </button>
            )}
        </div>
      )}
    </div>
  );
};
export default FinancierInteraction;
