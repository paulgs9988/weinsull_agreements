import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import PaymentEscrow from "/Users/paulsullivan/Weinsull/weinsull-agreements/src/PaymentEscrow.json";
import { InjectedConnector } from "@web3-react/injected-connector";
import {
  Grid,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 11155111],
});

const ClientInteraction = () => {
  const { account, library, activate } = useWeb3React();
  const [connected, setConnected] = useState(false);
  const [agreementId, setAgreementId] = useState("");
  const [escrowData, setEscrowData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

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

      if (escrowData.wagie !== account) {
        alert("You are not authorized to view this agreement.");
        return;
      }

      setEscrowData(escrowData);
      setPaymentData(paymentData);
    } catch (error) {
      console.error("Failed to fetch agreement data:", error);
    }
  };

  const handleMakePayment = async () => {
    if (!library || !account) {
      alert("Please connect your wallet");
      return;
    }
    setIsPaymentProcessing(true);

    const contractAddress = "0x3e2bB50B0F01aC9576948bAA786e1c864C3b5d22";
    const contract = new ethers.Contract(
      contractAddress,
      PaymentEscrow.abi,
      library.getSigner(account)
    );

    try {
      const paymentAmount = paymentData.paymentAmount;
      const transaction = await contract.makePayment(agreementId, {
        value: paymentAmount,
      });
      await transaction.wait();
      await handleGetAgreementData(); // Refresh agreement data after successful payment
    } catch (error) {
      console.error("Failed to make payment:", error);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  return (
    <div>
      {!connected && (
        <button onClick={() => activate(injectedConnector)}>Connect</button>
      )}
      {connected && (
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h6">Connected Address: {account}</Typography>
          </Grid>
          <Grid item>
            <TextField
              label="Enter Agreement ID"
              type="number"
              value={agreementId}
              onChange={(e) => setAgreementId(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGetAgreementData}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      )}

      {Object.keys(escrowData).length > 0 &&
        Object.keys(paymentData).length > 0 && (
          <Grid container spacing={2}>
            <Grid item>
              <Typography variant="body1">
                <strong>Financier:</strong> {escrowData.bigMoney}
              </Typography>
              <Typography variant="body1">
                <strong>Client:</strong> {escrowData.wagie}
              </Typography>
              <Typography variant="body1">
                <strong>Token:</strong> {escrowData.tokenAddress}
              </Typography>
              <Typography variant="body1">
                <strong>Amount in Escrow:</strong>{" "}
                {ethers.utils.formatEther(escrowData.amount.toString())}
              </Typography>
              <Typography variant="body1">
                <strong>Current Security Deposit in Escrow:</strong>{" "}
                {ethers.utils.formatEther(
                  escrowData.securityDepositAmount.toString()
                )}
              </Typography>
              <Typography variant="body1">
                <strong>Value at Deposit Time (WEI):</strong>{" "}
                {escrowData.totalDepositValueWei.toString()}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">
                <strong>Total payments due:</strong>{" "}
                {paymentData.numberOfPayments.toString()}
              </Typography>
              <Typography variant="body1">
                <strong>Payments Made:</strong>{" "}
                {paymentData.paymentsMade.toString()}
              </Typography>
              <Typography variant="body1">
                <strong>Established Rate:</strong>{" "}
                {paymentData.premiumRate.toString()}
              </Typography>
              <Typography variant="body1">
                <strong>Security Deposit Rate:</strong>{" "}
                {paymentData.securityDepositRate.toString()}
              </Typography>
              <Typography variant="body1">
                <strong>Next Payment Due:</strong>{" "}
                {new Date(paymentData.nextPaymentDue * 1000).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Current Standing:</strong>{" "}
                {paymentData.delinquent ? "Payment is Delinquent" : "Good"}
              </Typography>
            </Grid>
          </Grid>
        )}
      {Object.keys(escrowData).length > 0 &&
        Object.keys(paymentData).length > 0 &&
        paymentData.paymentsMade < paymentData.numberOfPayments && (
          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="body1">
                <strong>Your next payment amount is:</strong>{" "}
                {paymentData.paymentAmount.toString()} <strong>WEI</strong>
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                disabled={isPaymentProcessing}
                onClick={handleMakePayment}
              >
                {isPaymentProcessing ? (
                  <CircularProgress size={24} style={{ color: "white" }} />
                ) : (
                  "Click here to submit a payment"
                )}
              </Button>
            </Grid>
          </Grid>
        )}
    </div>
  );
};

export default ClientInteraction;
