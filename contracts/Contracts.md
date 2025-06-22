# FreelanceFlow Contracts

This directory contains the Soroban smart contracts for the FreelanceFlow dApp.

## Structure

```
contracts/
├── escrow/           # Main escrow contract
│   ├── src/
│   │   └── lib.rs   # Escrow contract implementation
│   └── Cargo.toml   # Rust dependencies
└── build.sh         # Build and deployment script
```

## Escrow Contract

The escrow contract handles secure payment processing between clients and freelancers.

### Key Functions

- `create_job()` - Creates a new job and locks funds in escrow
- `approve_job()` - Releases funds to freelancer upon client approval
- `cancel_job()` - Returns funds to client if job is cancelled
- `get_job()` - Retrieves job details
- `get_user_jobs()` - Gets all jobs for a specific user

### Building the Contract

```bash
# Install Soroban CLI first
# https://soroban.stellar.org/docs/getting-started/setup

# Build the contract
cd contracts
chmod +x build.sh
./build.sh
```

### Deploying to Testnet

1. **Setup Soroban Identity:**

   ```bash
   soroban keys generate --global alice
   soroban keys address alice
   ```

2. **Fund Account:**
   Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) and fund your account with test XLM.

3. **Deploy Contract:**

   ```bash
   soroban contract deploy \
     --source alice \
     --network testnet \
     --wasm target/wasm32-unknown-unknown/release/freelanceflow_escrow.wasm
   ```

4. **Initialize Contract:**
   ```bash
   soroban contract invoke \
     --source alice \
     --network testnet \
     --id <CONTRACT_ID> \
     -- initialize \
     --admin <ADMIN_ADDRESS>
   ```

### Testing

Run the contract tests:

```bash
cd contracts/escrow
cargo test
```

## Contract Features

### Security Features

- ✅ Access control with address authorization
- ✅ Input validation
- ✅ Status-based state transitions
- ✅ Persistent storage for job data

### Job Lifecycle

1. **Created** - Job is initialized
2. **InEscrow** - Funds are locked in contract
3. **Completed** - Work approved, funds released
4. **Cancelled** - Job cancelled, funds returned

### Future Enhancements

- Multi-signature approval for large payments
- Dispute resolution mechanism
- Time-based automatic releases
- Token support (USDC, custom tokens)
- Reputation system integration
