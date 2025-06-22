import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StrKey } from "@stellar/stellar-sdk";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WalletDebugger from "./components/WalletDebugger";
import { WalletState } from "./types";
import { stellarService } from "./utils/stellar";
import { config } from "./config";

function App() {
  const [walletState, setWalletState] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
    network: "TESTNET",
  });
  const [loading, setLoading] = useState(false);
  const [freighterAvailable, setFreighterAvailable] = useState(false);
  const connectWallet = async () => {
    try {
      setLoading(true);
      console.log("🔗 App: Starting wallet connection...");

      const state = await stellarService.connectFreighter();
      console.log("🔗 App: Received wallet state:", state);

      // Triple-check the state is valid before setting it
      if (!state.publicKey) {
        throw new Error("No public key received from Freighter");
      }

      if (typeof state.publicKey !== "string") {
        throw new Error(`Invalid public key type: ${typeof state.publicKey}`);
      }
      if (!StrKey.isValidEd25519PublicKey(state.publicKey)) {
        throw new Error(`Invalid public key format: ${state.publicKey}`);
      }

      console.log("✅ App: Wallet state validation passed, setting state");
      setWalletState(state);
    } catch (error) {
      console.error("❌ App: Failed to connect wallet:", error);

      // Reset wallet state on error
      setWalletState({
        publicKey: null,
        isConnected: false,
        network: "TESTNET",
      }); // Provide more specific error messages
      let errorMessage = "Cüzdan bağlanırken bir hata oluştu";
      if (error instanceof Error) {
        if (
          error.message.includes("not detected") ||
          error.message.includes("bulunamadı")
        ) {
          errorMessage =
            "Freighter cüzdanı bulunamadı. Lütfen Freighter uzantısını kurun ve sayfayı yenileyin.";
        } else if (error.message.includes("Testnet")) {
          errorMessage =
            "Lütfen Freighter cüzdanınızı Testnet ağına geçirin ve tekrar deneyin.";
        } else if (
          error.message.includes("Freighter uzantı bağlantısı kesildi") ||
          error.message.includes("Extension context invalidated") ||
          error.message.includes("context invalidated")
        ) {
          // Special handling for extension context errors - use confirm dialog for better UX
          const shouldReload = confirm(
            "Freighter uzantı bağlantısı kesildi. Bu genellikle şu durumlardan kaynaklanır:\n\n" +
              "🔄 Çözüm yolları:\n" +
              "• Freighter uzantısını kapatıp tekrar açın\n" +
              "• Tarayıcı sekmesini kapatıp tekrar açın\n" +
              "• Uzantı güncellemeleri veya uzun süreli inaktivite\n\n" +
              "Sayfayı şimdi yenilemek ister misiniz?"
          );
          if (shouldReload) {
            window.location.reload();
          }
          return; // Don't show additional alert
        } else if (
          error.message.includes("Geçersiz cüzdan adresi") ||
          error.message.includes("public key") ||
          error.message.includes("empty string")
        ) {
          errorMessage = error.message; // Use the detailed message from stellar.ts
        } else if (
          error.message.includes("unlocked") ||
          error.message.includes("kilidi açık")
        ) {
          errorMessage =
            "Freighter cüzdanının kilidi açık olduğundan ve aktif bir hesabınız olduğundan emin olun.";
        } else if (
          error.message.includes("Bağlantı reddedildi") ||
          error.message.includes("declined")
        ) {
          errorMessage =
            "Bağlantı reddedildi. Lütfen Freighter cüzdanınızda bağlantıyı onaylayın.";
        } else {
          errorMessage = error.message; // Show the actual error message
        }
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      publicKey: null,
      isConnected: false,
      network: "TESTNET",
    });
  };
  useEffect(() => {
    // Check for Freighter availability and existing connection
    const checkWalletStatus = async () => {
      try {
        console.log("🔍 App: Checking wallet status...");

        // Check if Freighter is available using the official API
        const freighterAvailable = await stellarService.isFreighterAvailable();
        console.log("🔍 App: Freighter available:", freighterAvailable);
        setFreighterAvailable(freighterAvailable);

        if (freighterAvailable) {
          try {
            // Check if already connected without requesting access
            console.log("🔍 App: Checking existing connection...");
            const existingConnection =
              await stellarService.checkExistingConnection();

            if (existingConnection) {
              console.log(
                "✅ App: Found existing connection:",
                existingConnection
              );

              // Validate existing connection before setting state
              if (
                existingConnection.publicKey &&
                typeof existingConnection.publicKey === "string" &&
                StrKey.isValidEd25519PublicKey(existingConnection.publicKey)
              ) {
                console.log(
                  "✅ App: Existing connection validation passed, setting state"
                );
                setWalletState(existingConnection);
              } else {
                console.error(
                  "❌ App: Existing connection failed validation:",
                  existingConnection.publicKey
                );
              }
            } else {
              console.log("ℹ️ App: No existing connection found");
            }
          } catch (error) {
            console.log(
              "⚠️ App: Freighter available but not connected:",
              error
            );
          }
        } else {
          console.log("❌ App: Freighter wallet not detected");
        }
      } catch (error) {
        console.error("❌ App: Error checking wallet status:", error);
        setFreighterAvailable(false);
      }
    };

    checkWalletStatus();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {" "}
        <Header
          walletState={walletState}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
          loading={loading}
          freighterAvailable={freighterAvailable}
        />{" "}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  walletState={walletState}
                  onConnect={connectWallet}
                  loading={loading}
                  freighterAvailable={freighterAvailable}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard walletState={walletState} />}
            />
          </Routes>
        </main>
        {config.ENABLE_WALLET_DEBUGGER && <WalletDebugger />}
      </div>
    </Router>
  );
}

export default App;
