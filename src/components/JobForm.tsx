import { useState, FC } from "react";
import { Job } from "../types";
import { stellarService } from "../utils/stellar";
import { contractService } from "../utils/contract";

interface JobFormProps {
  onJobCreated: (job: Job) => void;
  clientPublicKey: string;
}

const JobForm: FC<JobFormProps> = ({ onJobCreated, clientPublicKey }) => {
  const [formData, setFormData] = useState({
    freelancerAddress: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.freelancerAddress.trim()) {
      newErrors.freelancerAddress = "Freelancer address is required";
    } else if (!isValidStellarAddress(formData.freelancerAddress)) {
      newErrors.freelancerAddress =
        "Invalid Stellar address format (must start with G and be 56 characters)";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    } else if (Number(formData.amount) < 1) {
      newErrors.amount = "Minimum amount is 1 XLM";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidStellarAddress = (address: string): boolean => {
    // Basic Stellar address validation
    return /^G[A-Z2-7]{55}$/.test(address);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Check if freelancer account exists
      const freelancerExists = await stellarService.checkAccountExists(
        formData.freelancerAddress
      );
      if (!freelancerExists) {
        alert(
          "Freelancer account does not exist on the Stellar network. Please verify the address."
        );
        return;
      }

      // Check if client has sufficient balance
      const balance = await stellarService.getAccountBalance(clientPublicKey);
      const requiredAmount = Number(formData.amount) + 0.5; // Add some buffer for fees
      if (Number(balance) < requiredAmount) {
        alert(
          `Insufficient balance. You need at least ${requiredAmount} XLM (including fees).`
        );
        return;
      }
      const jobId = await contractService.createJob(
        clientPublicKey,
        formData.freelancerAddress,
        formData.amount,
        formData.description
      );

      // Create escrow transaction (for demo: direct payment to freelancer)
      const transactionXDR = await stellarService.createEscrowTransaction(
        clientPublicKey,
        formData.freelancerAddress,
        formData.amount,
        jobId
      );

      // Sign and submit transaction
      const transactionHash = await stellarService.signAndSubmitTransaction(
        transactionXDR,
        clientPublicKey
      );

      console.log("Transaction successful, hash:", transactionHash);

      // Get the created job from contract
      const newJob = await contractService.getJob(jobId);

      if (!newJob) {
        throw new Error("Failed to retrieve created job");
      }

      onJobCreated(newJob);

      // Reset form
      setFormData({
        freelancerAddress: "",
        amount: "",
        description: "",
      });

      alert(
        "Job created and payment sent successfully! Transaction hash: " +
          transactionHash.substring(0, 10) +
          "..."
      );
    } catch (error) {
      console.error("Error creating job:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to create job";
      if (error instanceof Error) {
        if (error.message.includes("insufficient balance")) {
          errorMessage = "Insufficient XLM balance to create this job.";
        } else if (error.message.includes("destination account")) {
          errorMessage =
            "Invalid freelancer address. Please check the address.";
        } else if (error.message.includes("bad_request")) {
          errorMessage =
            "Invalid transaction parameters. Please check all fields.";
        } else if (error.message.includes("User declined")) {
          errorMessage = "Transaction was cancelled by user.";
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="freelancerAddress"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Freelancer Stellar Address
          </label>
          <input
            type="text"
            id="freelancerAddress"
            name="freelancerAddress"
            value={formData.freelancerAddress}
            onChange={handleInputChange}
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className={`input-field ${
              errors.freelancerAddress ? "border-red-500" : ""
            }`}
          />
          {errors.freelancerAddress && (
            <p className="mt-1 text-sm text-red-600">
              {errors.freelancerAddress}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount (XLM)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="100.00"
            step="0.01"
            min="0"
            className={`input-field ${errors.amount ? "border-red-500" : ""}`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Description
          </label>{" "}
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the work to be completed..."
            rows={4}
            maxLength={500}
            className={`input-field resize-none ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <div>
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            <p
              className={`text-xs ${
                formData.description.length > 450
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Escrow Protection
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                Your payment will be securely held in escrow until you approve
                the completed work. The freelancer cannot access the funds until
                you release them.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Job..." : "Create Job & Lock Funds"}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
