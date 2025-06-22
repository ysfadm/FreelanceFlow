import { StrKey } from "@stellar/stellar-sdk";

// Mock contract interaction service until we can deploy the actual contract
// This simulates the escrow contract functionality

export interface Job {
  id: string;
  client: string;
  freelancer: string;
  amount: string;
  status: "InEscrow" | "Completed" | "Cancelled";
  createdAt: Date;
  description: string;
}

export interface ContractService {
  createJob(
    clientPublicKey: string,
    freelancerPublicKey: string,
    amount: string,
    description: string
  ): Promise<string>;

  approveJob(jobId: string, clientPublicKey: string): Promise<void>;
  cancelJob(jobId: string, clientPublicKey: string): Promise<void>;
  getJob(jobId: string): Promise<Job | null>;
  getUserJobs(userPublicKey: string): Promise<Job[]>;
}

class MockContractService implements ContractService {
  private jobs: Map<string, Job> = new Map();

  async createJob(
    clientPublicKey: string,
    freelancerPublicKey: string,
    amount: string,
    description: string
  ): Promise<string> {
    // Validate inputs
    if (!StrKey.isValidEd25519PublicKey(clientPublicKey)) {
      throw new Error("Invalid client public key");
    }

    if (!StrKey.isValidEd25519PublicKey(freelancerPublicKey)) {
      throw new Error("Invalid freelancer public key");
    }

    if (parseFloat(amount) <= 0) {
      throw new Error("Amount must be positive");
    }

    // Create job ID
    const jobId = `job_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create job
    const job: Job = {
      id: jobId,
      client: clientPublicKey,
      freelancer: freelancerPublicKey,
      amount,
      status: "InEscrow",
      createdAt: new Date(),
      description,
    };

    // Store job (in real implementation, this would be on Stellar blockchain)
    this.jobs.set(jobId, job);

    console.log("🔗 Mock Contract: Job created with ID:", jobId);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return jobId;
  }

  async approveJob(jobId: string, clientPublicKey: string): Promise<void> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.client !== clientPublicKey) {
      throw new Error("Only client can approve job");
    }

    if (job.status !== "InEscrow") {
      throw new Error("Job is not in escrow status");
    }

    job.status = "Completed";
    this.jobs.set(jobId, job);

    console.log("🔗 Mock Contract: Job approved:", jobId);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async cancelJob(jobId: string, clientPublicKey: string): Promise<void> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.client !== clientPublicKey) {
      throw new Error("Only client can cancel job");
    }

    if (job.status !== "InEscrow") {
      throw new Error("Cannot cancel job with current status");
    }

    job.status = "Cancelled";
    this.jobs.set(jobId, job);

    console.log("🔗 Mock Contract: Job cancelled:", jobId);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null;
  }

  async getUserJobs(userPublicKey: string): Promise<Job[]> {
    const userJobs: Job[] = [];

    for (const job of this.jobs.values()) {
      if (job.client === userPublicKey || job.freelancer === userPublicKey) {
        userJobs.push(job);
      }
    }

    return userJobs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

// Export the mock service for development
export const contractService: ContractService = new MockContractService();

// TODO: Replace with real Soroban contract service when deployed
// export const contractService: ContractService = new SorobanContractService();
