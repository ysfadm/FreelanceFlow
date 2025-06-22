import { useState, useEffect, FC } from "react";
import { WalletState, Job } from "../types";
import JobForm from "../components/JobForm";
import JobList from "../components/JobList";
import { stellarService } from "../utils/stellar";
import { contractService } from "../utils/contract";

interface DashboardProps {
  walletState: WalletState;
}

const Dashboard: FC<DashboardProps> = ({ walletState }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "list">("list");

  useEffect(() => {
    if (walletState.isConnected && walletState.publicKey) {
      loadBalance();
      loadJobs();
    }
  }, [walletState]);

  const loadBalance = async () => {
    if (!walletState.publicKey) return;

    try {
      const accountBalance = await stellarService.getAccountBalance(
        walletState.publicKey
      );
      setBalance(accountBalance);
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  };
  const loadJobs = async () => {
    if (!walletState.publicKey) return;

    try {
      // Use contract service to get user jobs
      const userJobs = await contractService.getUserJobs(walletState.publicKey);
      setJobs(userJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };
  const handleJobCreated = (newJob: Job) => {
    setJobs([...jobs, newJob]);
    setActiveTab("list");
    loadBalance(); // Refresh balance after creating job
  };
  const handleApproveJob = async (jobId: string) => {
    try {
      setLoading(true);

      if (!walletState.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Use contract service to approve job
      await contractService.approveJob(jobId, walletState.publicKey);

      const jobToApprove = jobs.find((job) => job.id === jobId);
      if (!jobToApprove) {
        throw new Error("Job not found");
      }

      // Create payment transaction to freelancer
      const transactionXDR = await stellarService.createPaymentTransaction(
        walletState.publicKey,
        jobToApprove.freelancer,
        jobToApprove.amount
      );

      // Sign and submit transaction
      await stellarService.signAndSubmitTransaction(
        transactionXDR,
        walletState.publicKey
      );

      // Reload jobs from contract service
      await loadJobs();
      loadBalance(); // Refresh balance after approval
      alert("Job approved and payment released successfully!");
    } catch (error) {
      console.error("Error approving job:", error);
      alert(error instanceof Error ? error.message : "Failed to approve job");
    } finally {
      setLoading(false);
    }
  };

  if (!walletState.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="card">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your Freighter wallet to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your freelance jobs and payments on Stellar
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Account Balance</div>
              <div className="text-2xl font-bold text-stellar-blue">
                {parseFloat(balance).toFixed(2)} XLM
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {walletState.publicKey?.slice(0, 6)}...
                {walletState.publicKey?.slice(-4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "list"
                ? "bg-white text-stellar-blue shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Your Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "create"
                ? "bg-white text-stellar-blue shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Create New Job
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "create" ? (
        <JobForm
          onJobCreated={handleJobCreated}
          clientPublicKey={walletState.publicKey!}
        />
      ) : (
        <JobList
          jobs={jobs}
          currentUser={walletState.publicKey!}
          onApproveJob={handleApproveJob}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Dashboard;
