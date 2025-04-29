import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";

import { registryId, systemProgram } from "./constant";

import { Registry, IDL } from "./types/registry";
import deployerKey from "./keys/deployer.json";

async function main() {
  const connection = new anchor.web3.Connection(
    process.env.SOLANA_NETWORK || "https://api.devnet.solana.com"
  );

  const deployer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(deployerKey)
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

  // execution authority
  await registry.rpc.setExecutionAuthority(
    globalStateBump,
    new anchor.web3.PublicKey("CbsSUTHmwruhA6sxk6LcBp2TEAGkfkxKbi2i3ro62vKb"),
    {
      accounts: {
        mainAuthority: wallet.publicKey,
        globalState: globalStateKey,
      },
    }
  );
}

main();
