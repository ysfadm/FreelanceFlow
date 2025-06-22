import { FC } from "react";
import { Link } from "react-router-dom";
import { WalletState } from "../types";

interface HomeProps {
  walletState: WalletState;
  onConnect: () => void;
  loading: boolean;
  freighterAvailable: boolean;
}

const Home: FC<HomeProps> = ({
  walletState,
  onConnect,
  loading,
  freighterAvailable,
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Web3 Freelance
            <span className="text-stellar-blue"> Payments</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            FreelanceFlow enables secure, trustless payments between clients and
            freelancers using Stellar's fast and low-cost blockchain
            infrastructure with smart contract escrow.
          </p>{" "}
          {walletState.isConnected ? (
            <Link
              to="/dashboard"
              className="inline-block btn-primary text-lg px-8 py-3"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-800">
                  Connect your Freighter wallet to get started
                </p>
              </div>

              {freighterAvailable ? (
                <button
                  onClick={onConnect}
                  disabled={loading}
                  className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Connecting..." : "Connect Freighter Wallet"}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-red-600 mb-4">
                    Freighter wallet not detected
                  </p>
                  <a
                    href="https://freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block btn-primary text-lg px-8 py-3"
                  >
                    Install Freighter Wallet
                  </a>
                </div>
              )}

              {freighterAvailable && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Don't have Freighter wallet?
                  </p>
                  <a
                    href="https://freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block btn-secondary"
                  >
                    Download Freighter Wallet
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-stellar-blue rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Secure Escrow
          </h3>
          <p className="text-gray-600">
            Payments are locked in smart contract escrow until work is approved,
            protecting both clients and freelancers.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-stellar-blue rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Fast & Low Cost
          </h3>
          <p className="text-gray-600">
            Built on Stellar network for lightning-fast transactions with
            minimal fees, typically completing in 3-5 seconds.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-stellar-blue rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Trustless
          </h3>
          <p className="text-gray-600">
            No intermediaries needed. Smart contracts automatically handle
            payments based on predefined conditions.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-stellar-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Job
              </h3>
              <p className="text-gray-600">
                Client creates a job posting with freelancer address and payment
                amount. Funds are automatically locked in escrow.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-stellar-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Work & Deliver
              </h3>
              <p className="text-gray-600">
                Freelancer completes the work knowing payment is guaranteed.
                Client reviews the delivered work.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-stellar-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Approve & Release
              </h3>
              <p className="text-gray-600">
                Once satisfied, client approves the work and smart contract
                automatically releases payment to freelancer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testnet Notice */}
      <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Running on Stellar Testnet
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>
                This dApp currently runs on Stellar's testnet for demonstration
                purposes. Get free test XLM from the{" "}
                <a
                  href="https://laboratory.stellar.org/#account-creator?network=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Stellar Laboratory
                </a>
                .
              </p>
              <p>
                Make sure your Freighter wallet is set to "Testnet" mode before
                using the application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
