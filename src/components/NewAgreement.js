// src/components/NewAgreement.js
import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { injectedConnector } from "../web3";
import { useNavigate } from "react-router-dom";
import LinkTokenABI from "../LinkTokenABI.json";
import PaymentEscrow from "../PaymentEscrow.json";

// This points at the contract itself, it also is currently just set up to allow
// Link tokens to be deposited
const contractABI = PaymentEscrow.abi;
const contractAddress = "0x3e2bB50B0F01aC9576948bAA786e1c864C3b5d22";
const tokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

const NewAgreement = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [depositAsset, setDepositAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [paymentPeriods, setPaymentPeriods] = useState("");
  const [premiumPercentage, setPremiumPercentage] = useState("");
  const [securityDepositPercentage, setSecurityDepositPercentage] =
    useState("");
  const [paymentPeriodDuration, setPaymentPeriodDuration] = useState("");
  const [gracePeriod, setGracePeriod] = useState("");
  const [escrowId, setEscrowId] = useState(null);
  const [agreementCreated, setAgreementCreated] = useState(false);

  const { activate, active, account, library } = useWeb3React();
  const history = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const [approvalInProgress, setApprovalInProgress] = useState(false);
  const [approvalDone, setApprovalDone] = useState(false);
  const [escrowInProgress, setEscrowInProgress] = useState(false);
  const [escrowDone, setEscrowDone] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const [step, setStep] = useState(1);
  const [displayAsset, setDisplayAsset] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");

  useEffect(() => {
    if (account) {
      setAddress(account);
    }
  }, [account]);

  const connectWallet = async () => {
    console.log("connecting to wallet...");
    try {
      await activate(injectedConnector);
      setConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleApprove = async () => {
    if (!amount) {
      alert("Please enter a valid amount.");
      return;
    }
    setApprovalInProgress(true);
    setProcessing(true);
    setProcessingMessage("Approval in process");
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        LinkTokenABI.abi,
        library.getSigner()
      );
      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      const tx = await tokenContract.approve(contractAddress, parsedAmount);
      await tx.wait();
      console.log("Token transfer approved");
    } catch (error) {
      console.error("Failed to approve:", error);
    }
    setApprovalInProgress(false);
    setApprovalDone(true);
    setProcessing(false);
    setStep(3);
    setDisplayAsset(depositAsset);
    setDisplayAmount(amount);
    setDepositAsset("");
    setAmount("");
  };

  const handleInitializeEscrow = async () => {
    setEscrowInProgress(true);
    setProcessing(true);
    setProcessingMessage("Escrow Initializing");
    console.log("handleInitializeEscrow called");
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        library.getSigner()
      );
      const parsedAmount = ethers.utils.parseUnits(displayAmount, 18); // Add this line to parse the amount
      const tx = await contract.initializeEscrow(
        clientAddress,
        displayAsset,
        parsedAmount
      ); // Update the arguments
      await tx.wait();
      console.log("Escrow Initialized");

      //Get the escrow ID
      const escrowCount = await contract.agreementCounter();
      setEscrowId(escrowCount.toNumber() - 1);
    } catch (error) {
      console.error("Failed to initialize escrow:", error);
    }
    setEscrowInProgress(false);
    setEscrowDone(true);
    setProcessing(false);
    setStep(5);
  };

  const handleInitializePayment = async () => {
    setProcessing(true);
    setProcessingMessage(
      "Financial Agreement is being finalized, please wait for your unique Agreement ID"
    );
    console.log("handleInitializePayment called");
    if (escrowId === null) {
      console.error("No escrow ID found. Please initialize escrow first.");
      return;
    }
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        library.getSigner()
      );
      const tx = await contract.initializePayment(
        escrowId,
        paymentPeriods,
        premiumPercentage,
        securityDepositPercentage,
        paymentPeriodDuration,
        gracePeriod
      );
      setPaymentInProgress(true);
      await tx.wait();
      console.log("Payment Initialized");

      setAgreementCreated(true);
    } catch (error) {
      console.error("Failed to initialize payment:", error);
    }
    setPaymentInProgress(false);
    setProcessing(false);
    setStep(6);
  };

  // Render the remaining form inputs, dropdowns, and buttons inside the connected component
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        New Financial Agreement
      </Typography>
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          {connected ? `You are currently connected with: ${address}` : ""}
        </Typography>
      </Box>
      {!connected ? (
        <>
          <Button variant="contained" color="primary" onClick={connectWallet}>
            Connect
          </Button>
        </>
      ) : (
        <>
          {step === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select the asset you are depositing</InputLabel>
                  <Select
                    value={depositAsset}
                    onChange={(e) => setDepositAsset(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={tokenAddress}>Chainlink (LINK)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount to deposit"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApprove}
                  disabled={approvalInProgress} //Disable the button while approving
                >
                  {approvalInProgress ? (
                    <>
                      <CircularProgress size={20} /> Approving...
                    </>
                  ) : (
                    "Approve"
                  )}
                </Button>
              </Grid>
            </Grid>
          )}

          {step === 2 && (
            <Typography variant="h6">
              Selected Asset: Chainlink (LINK)
              <br />
              Amount Being Deposited: {amount}
            </Typography>
          )}

          {step === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInitializeEscrow}
                  disabled={escrowInProgress}
                >
                  {escrowInProgress ? (
                    <>
                      <CircularProgress size={20} /> Initializing Escrow...
                    </>
                  ) : (
                    "Initialize Escrow"
                  )}
                </Button>
              </Grid>
            </Grid>
          )}

          {step === 4 && (
            <Typography variant="h6">
              Client Address: {clientAddress}
            </Typography>
          )}

          {step === 5 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Number of Payments"
                  type="number"
                  value={paymentPeriods}
                  onChange={(e) => setPaymentPeriods(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Premium Rate"
                  type="number"
                  value={premiumPercentage}
                  onChange={(e) => setPremiumPercentage(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Security Deposit Rate"
                  type="number"
                  value={securityDepositPercentage}
                  onChange={(e) => setSecurityDepositPercentage(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Period Length (in seconds)"
                  type="number"
                  value={paymentPeriodDuration}
                  onChange={(e) => setPaymentPeriodDuration(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Grace Period (in seconds)"
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInitializePayment}
                  disabled={paymentInProgress}
                >
                  {paymentInProgress ? (
                    <>
                      <CircularProgress size={20} /> Initializing Agreement...
                    </>
                  ) : (
                    "Create Agreement"
                  )}
                </Button>
              </Grid>
            </Grid>
          )}

          {step === 6 && (
            <Typography variant="h6">
              Agreement created successfully! Your Agreement ID is: {escrowId}
              <br />
              <br />
              In order to view the information relating to this contract and to
              interact with it, please visit the Financier Interaction component
              from the home page.
              {/* Number of Payments: {paymentPeriods}
              <br />
              Premium Rate: {premiumPercentage}%
              <br />
              Security Deposit Rate: {securityDepositPercentage}%
              <br />
              Payment Period Length: {paymentPeriodDuration} seconds */}
            </Typography>
          )}
        </>
      )}
    </Container>
  );
};

export default NewAgreement;
