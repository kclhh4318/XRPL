import { submitTransaction } from "@gemwallet/api";

export const swapTokens = async (
  fromAmount,
  fromCurrency,
  toCurrency,
  issuer
) => {
  try {
    // Prepare the transaction
    const transaction = {
      TransactionType: "OfferCreate",
      TakerGets: {
        currency: fromCurrency,
        value: fromAmount,
        issuer: fromCurrency === "XRP" ? undefined : issuer,
      },
      TakerPays: {
        currency: toCurrency,
        value: "1000000000000000e-96", // This is a placeholder, you should calculate the actual amount
        issuer: toCurrency === "XRP" ? undefined : issuer,
      },
    };

    // If the fromCurrency is XRP, we need to specify the amount in drops
    if (fromCurrency === "XRP") {
      transaction.TakerGets = (parseFloat(fromAmount) * 1000000).toString(); // Convert XRP to drops
    }

    // Submit the transaction
    const result = await submitTransaction({ transaction });

    console.log("Swap transaction submitted:", result);
    return result;
  } catch (error) {
    console.error("Swap failed:", error);
    throw error;
  }
};
