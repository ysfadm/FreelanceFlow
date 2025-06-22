import {
  Horizon,
  TransactionBuilder,
  Networks,
  StrKey,
  Asset,
  BASE_FEE,
  Memo,
  Operation,
} from "@stellar/stellar-sdk";
import freighterApi from "@stellar/freighter-api";
import { WalletState } from "../types";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = Networks.TESTNET;

// Helper function for error handling
function error(status: number, message: any) {
  const err = new Error(
    typeof message === "string" ? message : message.message
  );
  (err as any).status = status;
  return err;
}

// Helper function to create safe memo (max 28 bytes)
function createSafeMemo(text: string): Memo {
  // Convert to bytes to check actual size
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);

  if (bytes.length <= 28) {
    return Memo.text(text);
  }

  // If too long, truncate safely
  let truncated = text;
  while (encoder.encode(truncated).length > 28) {
    truncated = truncated.slice(0, -1);
  }

  console.warn(
    `Memo truncated from "${text}" to "${truncated}" (${
      encoder.encode(truncated).length
    } bytes)`
  );
  return Memo.text(truncated);
}

/**
 * Fetch account details from Stellar network
 */
export async function fetchAccount(publicKey: string) {
  if (StrKey.isValidEd25519PublicKey(publicKey)) {
    try {
      let account = await server.accounts().accountId(publicKey).call();
      return account;
    } catch (err: any) {
      if (err.response?.status === 404) {
        throw error(404, "account not funded on network");
      } else {
        throw error(err.response?.status ?? 400, {
          message: `${err.response?.title} - ${err.response?.detail}`,
        });
      }
    }
  } else {
    throw error(400, { message: "invalid public key" });
  }
}

/**
 * Fetch account balances from Stellar network
 */
export async function fetchAccountBalances(publicKey: string) {
  const { balances } = await fetchAccount(publicKey);
  return balances;
}

export class StellarService {
  private static instance: StellarService;

  public static getInstance(): StellarService {
    if (!StellarService.instance) {
      StellarService.instance = new StellarService();
    }
    return StellarService.instance;
  } // Check if already connected without requesting access
  async checkExistingConnection(): Promise<WalletState | null> {
    try {
      console.log("🔍 Checking existing Freighter connection...");
      const isConnected = await freighterApi.isConnected();
      console.log("🔍 Freighter isConnected status:", isConnected);
      if (isConnected) {
        console.log("🔍 Getting public key from existing connection...");

        // Try to get public key with retry logic for existing connections too
        let publicKey: string | null = null;
        let attempts = 0;
        const maxAttempts = 2; // Fewer attempts for existing connections

        while (attempts < maxAttempts) {
          attempts++;
          console.log(
            `🔍 Getting existing public key (attempt ${attempts}/${maxAttempts})...`
          );

          try {
            publicKey = await freighterApi.getPublicKey();
            console.log(
              "🔍 Public key from existing connection - type:",
              typeof publicKey,
              "length:",
              publicKey?.length,
              "value:",
              publicKey
            );

            // If we got a valid key, break out of retry loop
            if (
              publicKey &&
              typeof publicKey === "string" &&
              publicKey.length > 0
            ) {
              console.log(
                "✅ Got valid existing public key on attempt",
                attempts
              );
              break;
            }

            console.log(
              `⚠️ Invalid existing public key on attempt ${attempts}, retrying...`
            );
            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (retryError) {
            console.error(
              `❌ Error getting existing public key on attempt ${attempts}:`,
              retryError
            );

            // Check for extension context invalidated error in existing connection
            const errorMessage =
              (retryError as any)?.message || retryError?.toString() || "";
            if (
              errorMessage.includes("Extension context invalidated") ||
              errorMessage.includes("context invalidated") ||
              errorMessage.includes("Extension context") ||
              errorMessage.toLowerCase().includes("invalidated")
            ) {
              console.log(
                "🔄 Extension context invalidated for existing connection, will require fresh connection"
              );
              return null; // Return null to trigger fresh connection
            }

            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        } // Enhanced validation for existing connection
        if (publicKey === null || publicKey === undefined) {
          console.error(
            "❌ Public key is null or undefined from existing connection after retries"
          );
          return null;
        }

        if (typeof publicKey !== "string") {
          console.error(
            "❌ Public key is not a string from existing connection:",
            typeof publicKey
          );
          return null;
        }

        if (publicKey.length === 0) {
          console.error(
            "❌ Public key is empty string from existing connection after retries"
          );
          return null;
        }

        // Try to clean the public key for existing connection too
        const originalKey = publicKey;
        const cleanedKey = publicKey.trim().replace(/[^\w]/g, "");
        if (cleanedKey.length === 56 && cleanedKey.startsWith("G")) {
          publicKey = cleanedKey;
          console.log(
            "🧹 Cleaned existing public key from:",
            originalKey,
            "to:",
            publicKey
          );
        }

        if (!StrKey.isValidEd25519PublicKey(publicKey)) {
          console.error(
            "❌ Invalid public key format from existing connection:",
            publicKey
          );
          return null;
        }

        console.log("✅ Public key validation passed for existing connection");

        console.log("🔍 Getting network from existing connection...");
        const network = await freighterApi.getNetwork();
        console.log("🔍 Network from existing connection:", network);

        if (network === "TESTNET") {
          console.log("✅ Existing connection found and valid");
          return {
            publicKey,
            isConnected: true,
            network: "TESTNET",
          };
        } else {
          console.log("⚠️ Wrong network, expected TESTNET but got:", network);
          throw new Error("Please switch Freighter to Testnet network.");
        }
      }

      console.log("ℹ️ No existing connection found");
      return null;
    } catch (error) {
      console.error("❌ Error checking existing connection:", error);
      return null;
    }
  }
  async connectFreighter(): Promise<WalletState> {
    try {
      console.log("🔍 Starting Freighter connection...");

      // Pre-flight checks to ensure Freighter is ready
      console.log("🔍 Performing pre-flight checks...");

      // Check if Freighter is available first
      try {
        const isAllowed = await freighterApi.isAllowed();
        console.log("🔍 Freighter isAllowed (pre-flight):", isAllowed);
      } catch (preflightError) {
        console.error("❌ Pre-flight check failed:", preflightError);
        throw new Error(
          "Freighter cüzdanına erişilemiyor. Lütfen Freighter uzantısının kurulu ve etkin olduğundan emin olun."
        );
      }

      // Check if already connected
      const isConnected = await freighterApi.isConnected();
      console.log("🔍 Freighter isConnected:", isConnected);

      if (!isConnected) {
        console.log("🔍 Requesting Freighter access...");
        // Request permission to connect
        await freighterApi.requestAccess();

        // Wait a bit for Freighter to be ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the connection was established
        const isConnectedAfterRequest = await freighterApi.isConnected();
        console.log(
          "🔍 Connection status after request:",
          isConnectedAfterRequest
        );
      } // Try to get public key with enhanced retry logic
      let publicKey: string | null = null;
      let attempts = 0;
      const maxAttempts = 5; // Increased attempts
      const baseDelay = 1000; // Base delay in ms

      while (attempts < maxAttempts) {
        attempts++;
        console.log(
          `🔍 Getting public key (attempt ${attempts}/${maxAttempts})...`
        );

        try {
          // Add timeout to prevent hanging
          const publicKeyPromise = freighterApi.getPublicKey();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          );

          publicKey = (await Promise.race([
            publicKeyPromise,
            timeoutPromise,
          ])) as string;

          console.log(
            "🔍 Raw public key received:",
            "type:",
            typeof publicKey,
            "length:",
            publicKey?.length,
            "value:",
            JSON.stringify(publicKey),
            "first_char:",
            publicKey?.charAt(0),
            "is_string:",
            typeof publicKey === "string"
          ); // Enhanced validation
          if (publicKey === null || publicKey === undefined) {
            console.log(
              `⚠️ Public key is null/undefined on attempt ${attempts}`
            );
            throw new Error("Null public key");
          }

          if (typeof publicKey !== "string") {
            console.log(
              `⚠️ Public key is not string on attempt ${attempts}, type: ${typeof publicKey}`
            );
            throw new Error("Non-string public key");
          }

          if (publicKey.length === 0) {
            console.log(`⚠️ Public key is empty string on attempt ${attempts}`);

            // For empty public key, add longer delay and check if Freighter is still unlocked
            if (attempts < maxAttempts) {
              console.log(
                "🔍 Empty public key detected, checking Freighter status..."
              );

              try {
                // Check if Freighter is still connected and allowed
                const isAllowed = await freighterApi.isAllowed();
                console.log("🔍 Freighter isAllowed:", isAllowed);

                if (!isAllowed) {
                  console.log(
                    "🔑 Freighter permission revoked, requesting access again..."
                  );
                  await freighterApi.requestAccess();
                  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait longer after requesting access
                }
              } catch (statusError) {
                console.log("⚠️ Error checking Freighter status:", statusError);
              }
            }

            throw new Error("Empty public key");
          }

          // Try to clean the public key (remove any invisible characters)
          const originalKey = publicKey;
          const cleanedKey = publicKey.trim().replace(/[^\w]/g, "");
          if (cleanedKey.length === 56 && cleanedKey.startsWith("G")) {
            publicKey = cleanedKey;
            console.log(
              "🧹 Cleaned public key:",
              `${originalKey} -> ${publicKey}`
            );
          }

          // Validate with StrKey
          if (StrKey.isValidEd25519PublicKey(publicKey)) {
            console.log("✅ Got valid public key on attempt", attempts);
            break;
          } else {
            console.log(
              `⚠️ Invalid public key format on attempt ${attempts}:`,
              publicKey
            );
            throw new Error("Invalid public key format");
          }
        } catch (retryError: any) {
          console.error(
            `❌ Error getting public key on attempt ${attempts}:`,
            retryError.message || retryError
          );

          // Check for specific error types
          const errorMessage =
            retryError.message || retryError.toString() || "";

          // Check for extension context invalidated error
          if (
            errorMessage.includes("Extension context invalidated") ||
            errorMessage.includes("context invalidated") ||
            errorMessage.includes("Extension context") ||
            errorMessage.toLowerCase().includes("invalidated")
          ) {
            throw new Error(
              "Freighter uzantı bağlantısı kesildi. Bu genellikle şu durumlardan kaynaklanır:\n\n" +
                "🔄 Çözüm yolları:\n" +
                "1. Sayfayı yenileyin (F5)\n" +
                "2. Freighter uzantısını kapatıp tekrar açın\n" +
                "3. Tarayıcı sekmesini kapatıp tekrar açın\n" +
                "4. Gerekirse tarayıcıyı yeniden başlatın\n\n" +
                "Bu hata genellikle uzantı güncellemeleri veya uzun süreli inaktivite sonrası oluşur."
            );
          }

          // Check for user declined access
          if (
            errorMessage.includes("User declined access") ||
            errorMessage.includes("declined") ||
            errorMessage.includes("rejected")
          ) {
            throw new Error(
              "Bağlantı reddedildi. Lütfen Freighter cüzdanınızda bağlantıyı onaylayın."
            );
          } // Check for timeout
          if (errorMessage.includes("Timeout")) {
            console.log(`⏱️ Timeout on attempt ${attempts}, retrying...`);
          }

          // Check for empty public key
          if (errorMessage.includes("Empty public key")) {
            console.log(
              `🔍 Empty public key on attempt ${attempts}, implementing longer delay...`
            );
          }

          if (attempts < maxAttempts) {
            // Use longer delays for certain error types
            let delay = baseDelay * attempts; // Linear backoff

            if (errorMessage.includes("Empty public key")) {
              delay = Math.max(delay, 2000); // Minimum 2 second delay for empty key
              console.log(`⏳ Extended delay for empty public key: ${delay}ms`);
            } else if (errorMessage.includes("Null public key")) {
              delay = Math.max(delay, 1500); // Minimum 1.5 second delay for null key
              console.log(`⏳ Extended delay for null public key: ${delay}ms`);
            }

            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      } // Final validation after all attempts
      if (!publicKey || !StrKey.isValidEd25519PublicKey(publicKey)) {
        const errorDetails = {
          publicKey,
          type: typeof publicKey,
          length: publicKey?.length,
          attempts: maxAttempts,
        };
        console.error(
          "❌ Failed to get valid public key after all attempts:",
          errorDetails
        );
        throw new Error(
          `Geçersiz cüzdan adresi alındı (${maxAttempts} deneme sonrası). ` +
            `\n\nAldığımız değer: ${JSON.stringify(publicKey)}\n` +
            `Tip: ${typeof publicKey}, Uzunluk: ${publicKey?.length}\n\n` +
            `🔧 Çözüm önerileri:\n` +
            `1. Freighter cüzdanının tamamen açık ve kilidi açılmış olduğundan emin olun\n` +
            `2. Freighter'da aktif bir hesap seçili olduğundan emin olun\n` +
            `3. Freighter uzantısını tamamen kapatıp yeniden açın\n` +
            `4. Tarayıcı sekmesini kapatıp yeni sekme açın\n` +
            `5. Gerekirse tarayıcıyı yeniden başlatın\n` +
            `6. Freighter uzantısını güncelleyin\n\n` +
            `🔍 Boş cüzdan adresi genellikle Freighter'ın geçici olarak yanıt vermemesinden kaynaklanır.`
        );
      }

      console.log("✅ Public key validation passed");

      // Get network info
      console.log("🔍 Getting network info...");
      const network = await freighterApi.getNetwork();
      console.log("🔍 Network received:", network);
      if (network !== "TESTNET") {
        throw new Error("Lütfen Freighter cüzdanınızı Testnet ağına geçirin.");
      }

      console.log("✅ Freighter connection successful!");
      return {
        publicKey,
        isConnected: true,
        network: "TESTNET",
      };
    } catch (error: any) {
      console.error("❌ Error connecting to Freighter:", error);

      // Check if it's already our custom error with specific message
      if (
        error.message &&
        (error.message.includes("Freighter uzantı bağlantısı kesildi") ||
          error.message.includes("Bağlantı reddedildi") ||
          error.message.includes("Geçersiz cüzdan adresi"))
      ) {
        throw error; // Re-throw our custom errors as-is
      }

      // Handle other extension context errors that might escape
      const errorMessage = error.message || error.toString() || "";
      if (
        errorMessage.includes("Extension context invalidated") ||
        errorMessage.includes("context invalidated") ||
        errorMessage.includes("Extension context") ||
        errorMessage.toLowerCase().includes("invalidated")
      ) {
        throw new Error(
          "Freighter uzantı bağlantısı kesildi. Bu genellikle şu durumlardan kaynaklanır:\n\n" +
            "🔄 Çözüm yolları:\n" +
            "1. Sayfayı yenileyin (F5)\n" +
            "2. Freighter uzantısını kapatıp tekrar açın\n" +
            "3. Tarayıcı sekmesini kapatıp tekrar açın\n" +
            "4. Gerekirse tarayıcıyı yeniden başlatın\n\n" +
            "Bu hata genellikle uzantı güncellemeleri veya uzun süreli inaktivite sonrası oluşur."
        );
      }

      // Generic error handling for other cases
      throw error;
    }
  } // Check if Freighter is available using the official API
  async isFreighterAvailable(): Promise<boolean> {
    try {
      // Try to check if Freighter is available
      await freighterApi.isAllowed();
      return true; // If no error thrown, Freighter is available
    } catch (error) {
      return false;
    }
  } // Check if account exists on the network
  async checkAccountExists(publicKey: string): Promise<boolean> {
    try {
      await fetchAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }
  async getAccountBalance(publicKey: string): Promise<string> {
    try {
      console.log(
        "💰 Getting balance for public key:",
        typeof publicKey,
        "Length:",
        publicKey?.length,
        "Value:",
        publicKey
      );

      // Strict validation with detailed logging
      if (publicKey === null || publicKey === undefined) {
        console.error("❌ Public key is null or undefined");
        throw new Error("Public key is null or undefined");
      }

      if (typeof publicKey !== "string") {
        console.error("❌ Public key is not a string, type:", typeof publicKey);
        throw new Error("Public key must be a string");
      }

      if (publicKey.length === 0) {
        console.error("❌ Public key is empty string");
        throw new Error("Public key is empty");
      }

      // Use StrKey validation instead of manual checks
      if (!StrKey.isValidEd25519PublicKey(publicKey)) {
        console.error("❌ Invalid public key format:", publicKey);
        throw new Error("Invalid public key format");
      }

      console.log("✅ Public key validation passed successfully");

      console.log("💰 Fetching account balances...");
      const balances = await fetchAccountBalances(publicKey);
      console.log("💰 Balances loaded successfully:", balances);

      const xlmBalance = balances.find(
        (balance: any) => balance.asset_type === "native"
      );

      const balanceAmount = xlmBalance?.balance || "0";
      console.log("💰 XLM Balance found:", balanceAmount);

      return balanceAmount;
    } catch (error) {
      console.error("❌ Error fetching account balance:", error);

      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes("account not found")) {
          console.log("ℹ️ Account not found - probably not funded yet");
          return "0";
        }

        if (error.message.includes("bad_request")) {
          console.error("❌ Bad request error - invalid address format");
          throw new Error(
            "Invalid wallet address format. Please reconnect your wallet."
          );
        }

        if (error.message.includes("Public key")) {
          // Re-throw validation errors
          throw error;
        }
      }

      // For other errors, return 0 but log them
      console.error("❌ Unexpected error, returning 0 balance");
      return "0";
    }
  }
  async createEscrowTransaction(
    clientPublicKey: string,
    freelancerPublicKey: string,
    amount: string,
    jobId: string
  ): Promise<string> {
    try {
      const sourceAccount = await server.loadAccount(clientPublicKey);

      // For demo purposes, we'll create a transaction that sends funds to the freelancer
      // In a real implementation, this would be a smart contract address
      // For now, we'll use the freelancer address as the destination
      // This simulates placing funds in escrow (though they go directly to freelancer)

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: freelancerPublicKey,
            asset: Asset.native(),
            amount: amount,
            source: clientPublicKey,
          })
        )
        .addMemo(createSafeMemo(`FL:${jobId}`)) // Safe memo with length check
        .setTimeout(300)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error("Error creating escrow transaction:", error);
      throw error;
    }
  }
  async signAndSubmitTransaction(
    transactionXDR: string,
    publicKey: string
  ): Promise<string> {
    try {
      const signedXDR = await freighterApi.signTransaction(transactionXDR, {
        network: "TESTNET",
        networkPassphrase,
        accountToSign: publicKey,
      });

      const transaction = TransactionBuilder.fromXDR(
        signedXDR,
        networkPassphrase
      );
      const result = await server.submitTransaction(transaction);

      return result.hash;
    } catch (error) {
      console.error("Error signing and submitting transaction:", error);
      throw error;
    }
  }

  async createPaymentTransaction(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string
  ): Promise<string> {
    try {
      const sourceAccount = await server.loadAccount(sourcePublicKey);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: destinationPublicKey,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(300)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error("Error creating payment transaction:", error);
      throw error;
    }
  }

  // Mock function for smart contract interaction
  // In a real implementation, this would interact with a Soroban contract
  async callEscrowContract(
    contractId: string,
    method: string,
    params: any[]
  ): Promise<any> {
    console.log(
      `Calling contract ${contractId} method ${method} with params:`,
      params
    );

    // Mock implementation
    switch (method) {
      case "create_job":
        return { success: true, jobId: params[3] };
      case "approve_job":
        return { success: true, released: true };
      default:
        throw new Error(`Unknown contract method: ${method}`);
    }
  }
}

export const stellarService = StellarService.getInstance();
