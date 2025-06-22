export interface Job {
  id: string;
  client: string;
  freelancer: string;
  amount: string;
  description: string;
  status: "InEscrow" | "Completed" | "Cancelled";
  createdAt: Date;
  completedAt?: Date;
}

export interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: string;
}

export interface EscrowContract {
  contractId: string;
  network: string;
}
