# Ethena USDe Example

This project demonstrates how to interact with the Ethena blockchain using the USDe token. It utilizes the ZeroDev SDK and other libraries to create and manage accounts, send transactions, and more.

## Prerequisites

1. **ZeroDev Dashboard**: 
   - Create an account on the [ZeroDev Dashboard](https://dashboard.zerodev.app).
   - Deploy a self-funded paymaster and fund it.
   - Set a conversion rate for USDe.

2. **Environment Setup**:
   - Ensure you have Node.js and Yarn installed on your machine.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zerodevapp/usde-sponsorship-example
   cd usde-sponsorship-example
   ```

2. Install the dependencies:

   ```bash
   yarn
   ```

3. Copy the `.env.example` file to `.env` and fill in the required values:

   ```bash
   cp .env.example .env
   ```

   Ensure you set the following environment variables in your `.env` file:

   - `BUNDLER_RPC`
   - `PAYMASTER_RPC`
   - `PRIVATE_KEY`

## Usage

1. **Get Account Address**:

   Run the following command to get the address of the account:

   ```bash
   yarn getAddress
   ```

2. **Fund the Account**:

   Send USDe to the account address obtained in the previous step. This will allow the account to pay for transactions using the USDe token.

3. **Send a Transaction**:

   Once the account is funded, you can send a transaction using the following command:

   ```bash
   yarn sendTransaction
   ```

## Relevant Code

The main logic for interacting with the Ethena blockchain is located in the `src` directory. You can find the relevant code in the following file:

- `src/example.ts`

## License

This project is licensed under the MIT License.
