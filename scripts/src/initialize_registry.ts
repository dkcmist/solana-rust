import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";

import { registryId, systemProgram } from "./constant";

import { Registry, IDL } from "./types/registry";
import deployerKey from "./keys/deployer.json";
import executorKey from "./keys/executor.json";

async function main() {
  const connection = new anchor.web3.Connection(
    process.env.SOLANA_NETWORK || "https://api.devnet.solana.com"
  );

  const deployer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(deployerKey)
  );
  const executor = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(executorKey)
  );
  const wallet = new anchor.Wallet(deployer);
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  });
  anchor.setProvider(provider);

  const registry = new anchor.Program(IDL, registryId) as Program<Registry>;

  const [globalStateKey, globalStateBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("global-state")],
      registry.programId
    );

  // initialize
  await registry.rpc.initialize(globalStateBump, {
    accounts: {
      initializer: wallet.publicKey,
      globalState: globalStateKey,
      systemProgram,
    },
  });

  // execution authority
  await registry.rpc.setExecutionAuthority(
    globalStateBump,
    executor.publicKey,
    {
      accounts: {
        mainAuthority: wallet.publicKey,
        globalState: globalStateKey,
      },
    }
  );
}

main();
