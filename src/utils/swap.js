import { submitTransaction, createOffer } from "@gemwallet/api";

const issuer = "rptFh8329i1noq6pizSbbABxE1yMxkaijs";

export const swapTokens = async (
  fromAmount,
  fromCurrency,
  toAmount,
  toCurrency
) => {
  try {
    // Prepare the transaction
    const transaction = {
      takerGets: {
        currency: fromCurrency,
        value: fromAmount,
        issuer: fromCurrency === "XRP" ? undefined : issuer,
      },
      takerPays: {
        currency: toCurrency,
        value: toAmount,
        issuer: toCurrency === "XRP" ? undefined : issuer,
      },
    };

    // If the fromCurrency is XRP, we need to specify the amount in drops
    if (fromCurrency === "XRP") {
      transaction.takerGets = (parseFloat(fromAmount) * 1000000).toString(); // Convert XRP to drops
    } else {
      transaction.takerPays = (parseFloat(fromAmount) * 1000000).toString(); // Convert XRP to drops
    }

    // Submit the transaction
    const result = await createOffer(transaction);

    console.log("Swap transaction submitted:", result);
    return result;
  } catch (error) {
    console.error("Swap failed:", error);
    throw error;
  }
};
