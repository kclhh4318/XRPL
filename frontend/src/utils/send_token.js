
// {
//     "TransactionType":"Payment"
//     "Account":"rDqgGZ9b6hDmimY5S5amGscDV7FALeGMSc"
//     "Amount":{
//     "currency":"UDH"
//     "issuer":"rUHJCnCQes5SdVbGXPgCTKwj9WZSKn6YbW"
//     "value":"1"
//     }
//     "Destination":"rwqrm6neavQvLG72JJPRfJZew8souZd9GA"
//     "Memos":undefined
//     "DestinationTag":undefined
//     }

import { submitTransaction } from "@gemwallet/api";

export const sendToken = async (amount, walletAddress) => {
  try {
    const transaction = {
      TransactionType: "Payment",
      Account: walletAddress,
      Amount: {
        currency: "UDH",
        issuer: "rUHJCnCQes5SdVbGXPgCTKwj9WZSKn6YbW",
        value: amount,
      },
      Destination: "rDqgGZ9b6hDmimY5S5amGscDV7FALeGMSc",
    };
    const result = await submitTransaction({ transaction });

    console.log("Swap transaction submitted:", result);
    return result;
  } catch (error) {
    console.error("Swap failed:", error);
    throw error;
  }
};
