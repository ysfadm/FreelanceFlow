#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Address, Map, log, Error};

// Data types for the escrow contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Job {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub status: JobStatus,
    pub job_id: Symbol,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum JobStatus {
    Created,
    InEscrow,
    Completed,
    Cancelled,
}

const JOBS: Symbol = symbol_short!("JOBS");
const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
    }

    /// Create a new job and lock funds in escrow
    pub fn create_job(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
        job_id: Symbol,
    ) -> Result<(), Error> {        // Verify client authorization
        client.require_auth();        // Validate inputs
        if amount <= 0 {
            log!(&env, "Error: Amount must be positive");
            return Err(Error::from_contract_error(1));
        }

        // Check if job already exists
        let mut jobs: Map<Symbol, Job> = env.storage().persistent().get(&JOBS).unwrap_or(Map::new(&env));
        
        if jobs.contains_key(job_id.clone()) {
            log!(&env, "Error: Job already exists");
            return Err(Error::from_contract_error(2));
        }

        // Create the job
        let job = Job {
            client: client.clone(),
            freelancer: freelancer.clone(),
            amount,
            status: JobStatus::InEscrow,            job_id: job_id.clone(),
        };        // Store the job
        jobs.set(job_id.clone(), job);
        env.storage().persistent().set(&JOBS, &jobs);

        // In a real implementation, we would also handle the token transfer here
        // For now, we'll assume the payment is handled off-chain
        log!(&env, "Job created successfully with ID: {}", job_id.clone());
        
        Ok(())
    }    /// Approve a job and release funds to freelancer
    pub fn approve_job(env: Env, job_id: Symbol) -> Result<(), Error> {
        let mut jobs: Map<Symbol, Job> = env.storage().persistent().get(&JOBS).unwrap_or(Map::new(&env));
        
        // Get the job
        let mut job = jobs.get(job_id.clone()).ok_or(Error::from_contract_error(3))?;

        // Verify client authorization
        job.client.require_auth();

        // Check job status
        if job.status != JobStatus::InEscrow {
            log!(&env, "Error: Job is not in escrow status");
            return Err(Error::from_contract_error(4));
        }

        // Update job status
        job.status = JobStatus::Completed;
        jobs.set(job_id.clone(), job);
        env.storage().persistent().set(&JOBS, &jobs);

        // In a real implementation, we would transfer the funds to the freelancer here
        log!(&env, "Job approved and funds released to freelancer");
        
        Ok(())
    }    /// Cancel a job and return funds to client (only if work hasn't started)
    pub fn cancel_job(env: Env, job_id: Symbol) -> Result<(), Error> {
        let mut jobs: Map<Symbol, Job> = env.storage().persistent().get(&JOBS).unwrap_or(Map::new(&env));
        
        // Get the job
        let mut job = jobs.get(job_id.clone()).ok_or(Error::from_contract_error(3))?;

        // Verify client authorization
        job.client.require_auth();

        // Check job status (can only cancel if in escrow)
        if job.status != JobStatus::InEscrow {
            log!(&env, "Error: Cannot cancel job with current status");
            return Err(Error::from_contract_error(5));
        }

        // Update job status
        job.status = JobStatus::Cancelled;
        jobs.set(job_id.clone(), job);
        env.storage().persistent().set(&JOBS, &jobs);

        // In a real implementation, we would return the funds to the client here
        log!(&env, "Job cancelled and funds returned to client");
        
        Ok(())
    }    /// Get job details
    pub fn get_job(env: Env, job_id: Symbol) -> Option<Job> {
        let jobs: Map<Symbol, Job> = env.storage().persistent().get(&JOBS).unwrap_or(Map::new(&env));
        jobs.get(job_id.clone())
    }

    /// Get all jobs for a specific user (client or freelancer)
    pub fn get_user_jobs(env: Env, user: Address) -> Map<Symbol, Job> {
        let jobs: Map<Symbol, Job> = env.storage().persistent().get(&JOBS).unwrap_or(Map::new(&env));
        let mut user_jobs = Map::new(&env);        // Iterate through all jobs and filter by user
        for (job_id, job) in jobs.iter() {
            if job.client == user || job.freelancer == user {
                user_jobs.set(job_id, job);
            }
        }

        user_jobs
    }

    /// Get contract admin
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&ADMIN)
    }    /// Update contract admin (only admin can do this)
    pub fn set_admin(env: Env, new_admin: Address) -> Result<(), Error> {
        let current_admin: Address = env.storage().instance().get(&ADMIN).ok_or(Error::from_contract_error(6))?;
        current_admin.require_auth();
        
        env.storage().instance().set(&ADMIN, &new_admin);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_create_job() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);
        let job_id = symbol_short!("JOB001");

        // Initialize contract
        client.initialize(&admin);// Create job
        client.create_job(&client_addr, &freelancer_addr, &1000, &job_id);

        // Verify job was created
        let job = client.get_job(&job_id);
        assert!(job.is_some());
        
        let job = job.unwrap();
        assert_eq!(job.client, client_addr);
        assert_eq!(job.freelancer, freelancer_addr);
        assert_eq!(job.amount, 1000);
        assert_eq!(job.status, JobStatus::InEscrow);
    }    #[test]
    fn test_approve_job() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);
        let job_id = symbol_short!("JOB001");

        // Initialize and create job
        client.initialize(&admin);        client.create_job(&client_addr, &freelancer_addr, &1000, &job_id);

        // Approve job
        client.approve_job(&job_id);        // Verify job status changed
        let job = client.get_job(&job_id);
        assert!(job.is_some());
        
        let job = job.unwrap();
        assert_eq!(job.status, JobStatus::Completed);
    }    #[test]
    fn test_cancel_job() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);
        let job_id = symbol_short!("JOB001");

        // Initialize and create job
        client.initialize(&admin);        client.create_job(&client_addr, &freelancer_addr, &1000, &job_id);

        // Cancel job
        client.cancel_job(&job_id);

        // Verify job status changed
        let job = client.get_job(&job_id);
        assert!(job.is_some());
        
        let job = job.unwrap();
        assert_eq!(job.status, JobStatus::Cancelled);
    }
}
