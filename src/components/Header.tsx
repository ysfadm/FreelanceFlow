import { FC } from "react";
import { Link } from "react-router-dom";
import { WalletState } from "../types";

interface HeaderProps {
  walletState: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
  freighterAvailable?: boolean;
}

const Header: FC<HeaderProps> = ({
  walletState,
  onConnect,
  onDisconnect,
  loading,
  freighterAvailable = true,
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-stellar-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                FreelanceFlow
              </span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-stellar-blue transition-colors"
              >
                Home
              </Link>
              {walletState.isConnected && (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-stellar-blue transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {walletState.isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {formatAddress(walletState.publicKey!)}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {walletState.network}
                  </span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {!freighterAvailable && (
                  <div className="text-sm text-red-600 mr-4">
                    Freighter wallet not detected
                  </div>
                )}
                <button
                  onClick={onConnect}
                  disabled={loading || !freighterAvailable}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !freighterAvailable
                      ? "Please install Freighter wallet extension"
                      : ""
                  }
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </button>
                {!freighterAvailable && (
                  <a
                    href="https://freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stellar-blue hover:underline"
                  >
                    Install Freighter
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
