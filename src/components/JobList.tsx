import { FC } from "react";
import { Job } from "../types";

interface JobListProps {
  jobs: Job[];
  currentUser: string;
  onApproveJob: (jobId: string) => void;
  loading: boolean;
}

const JobList: FC<JobListProps> = ({
  jobs,
  currentUser,
  onApproveJob,
  loading,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "InEscrow":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="card text-center py-12">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
        <p className="text-gray-500">
          Create your first job to get started with FreelanceFlow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Jobs</h2>

      {jobs.map((job) => (
        <div key={job.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Job #{job.id.slice(-8)}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    job.status
                  )}`}
                >
                  {job.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 mb-3">{job.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Client:</span>
                  <div className="font-mono text-gray-900">
                    {job.client === currentUser
                      ? "You"
                      : formatAddress(job.client)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Freelancer:</span>
                  <div className="font-mono text-gray-900">
                    {job.freelancer === currentUser
                      ? "You"
                      : formatAddress(job.freelancer)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="text-gray-900">
                    {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right ml-6">
              <div className="text-2xl font-bold text-stellar-blue mb-2">
                {job.amount} XLM
              </div>{" "}
              {job.client === currentUser && job.status === "InEscrow" && (
                <button
                  onClick={() => onApproveJob(job.id)}
                  disabled={loading}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Approving..." : "Approve & Release"}
                </button>
              )}
              {job.freelancer === currentUser && job.status === "InEscrow" && (
                <div className="text-sm text-gray-500">
                  Waiting for client approval
                </div>
              )}
              {job.status === "Completed" && job.completedAt && (
                <div className="text-sm text-green-600">
                  Completed on {formatDate(job.completedAt)}
                </div>
              )}
            </div>
          </div>

          {job.status === "InEscrow" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-center">
                <svg
                  className="h-4 w-4 text-blue-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-blue-700">
                  Funds are securely locked in escrow
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default JobList;
