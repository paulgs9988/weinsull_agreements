# Weinsull Agreements

This application enables a unique "payday investment" structure, facilitating two-party financial agreements on Ethereum's Sepolia Testnet. It's designed to help individuals who have identified a promising investment opportunity but lack the necessary funds upfront. By enabling regular income investments through a smart contract, this application allows users to invest in their chosen project now and pay over time with their future income.

## Features

- **Smart Contract Integration**: The application interacts with a smart contract on Ethereum's Sepolia Testnet, allowing secure and reliable financial agreements.
- **Two-party Agreements**: The application supports a two-party financial agreement model with a financier (bigMoney) and an investor (wagie).
- **Payday Investment Structure**: The application implements a "payday investment" structure, enabling users to invest in promising projects using periodic income sources.
- **Flexible Agreement Terms**: Users can define the premium percentage, security deposit rate, payment timing, and grace period for payments.
- **Security Deposit Management**: The application manages security deposits, holding them in the smart contract and distributing them back to the investor upon successful completion of the agreement, or to the financier if the agreement is terminated due to delinquency.
- **Token Holding**: The smart contract purchases and holds tokens as part of the investment agreement.
- **Grace Period for Payments**: The application allows a specified grace period after which a payment would be considered delinquent.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js and npm](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)

### Installation and Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/paulgs9988/weinsull_agreements.git
   ```

````
2. Navigate to the project directory:
```sh
cd weinsull_agreements
````

3. Install the dependencies:

```sh
npm install
```

4. Start the development severe:

```sh
npm start
```

Visit http://localhost:3000 in your browser to view the application (or whatever locahost you used).

### Using the application

You can access three different components from the home page: the New Agreement component, the Financier Interaction component, and the Client Interaction component. The two former agreements are accessed by the financier's (bigMoney's) wallet, while the latter is accessed by the client's wallet (wagie). When creating a new agreement, specify the terms of the agreement and everything else should be pretty straight forward.

### Contributing

If you would like to contribute, please fork the project and use a feature branch. Pull requests are warmly welcome.

### Links

Related Projects:

### Licensing

“The code in this project is licensed under MIT license.”

### Authors

-Paul Sullivan paulgs9988@gmail.com
