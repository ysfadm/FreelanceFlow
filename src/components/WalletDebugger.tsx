import { FC, useEffect, useState } from "react";
import freighterApi from "@stellar/freighter-api";

const WalletDebugger: FC = () => {
  const [debugInfo, setDebugInfo] = useState<{
    freighterDetected: boolean;
    userAgent: string;
    freighterConnected: boolean;
    freighterStatus: string;
  }>({
    freighterDetected: false,
    userAgent: "",
    freighterConnected: false,
    freighterStatus: "Checking...",
  });

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const isAllowed = await freighterApi.isAllowed();
        const isConnected = await freighterApi.isConnected();

        const info = {
          freighterDetected: true, // If we got here, Freighter is available
          userAgent: navigator.userAgent,
          freighterConnected: isConnected,
          freighterStatus: isAllowed
            ? isConnected
              ? "Connected"
              : "Available"
            : "Not allowed",
        };

        setDebugInfo(info);
        console.log("Freighter Debug Info:", info);
      } catch (error) {
        const info = {
          freighterDetected: false,
          userAgent: navigator.userAgent,
          freighterConnected: false,
          freighterStatus: "Not available",
        };

        setDebugInfo(info);
        console.log("Freighter Debug Info:", info, error);
      }
    };

    // Check immediately
    checkWallet();

    // Check again after a delay (in case Freighter loads later)
    const timer = setTimeout(checkWallet, 2000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Wallet Debug</h4>
      <div className="space-y-1">
        <div>Freighter: {debugInfo.freighterDetected ? "✅" : "❌"}</div>
        <div>Connected: {debugInfo.freighterConnected ? "✅" : "❌"}</div>
        <div>Status: {debugInfo.freighterStatus}</div>
        <div>
          Browser:{" "}
          {debugInfo.userAgent.includes("Chrome")
            ? "Chrome"
            : debugInfo.userAgent.includes("Firefox")
            ? "Firefox"
            : debugInfo.userAgent.includes("Safari")
            ? "Safari"
            : "Other"}
        </div>
      </div>
    </div>
  );
};

export default WalletDebugger;
