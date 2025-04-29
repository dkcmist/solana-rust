import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";

import {
  rent,
  clock,
  systemProgram,
  tokenProgram,
  wrapperId,
} from "./constant";

import assert from "assert";

import {
  WrapperRaydium,
  IDL as WrapperRaydiumIdl,
} from "./types/wrapper_raydium";
import deployerKey from "./keys/deployer.json";

async function main() {
  const connection = new anchor.web3.Connection(
    process.env.SOLANA_NETWORK || "https://api.devnet.solana.com"
  );

  const initializer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(deployerKey)
  );
  const wallet = new anchor.Wallet(initializer);
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  });
  anchor.setProvider(provider);

  const wrapper = new anchor.Program(
    WrapperRaydiumIdl as any,
    wrapperId
  ) as Program<WrapperRaydium>;


  const [wrapperStateKey, wrapperStateBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("wrapper-state")],
      wrapper.programId
    );

  await wrapper.rpc.initialize(wrapperStateBump, {
    accounts: {
      signer: initializer.publicKey,
      wrapperState: wrapperStateKey,
      systemProgram,
    },
    signers: [initializer]
  });


}

main();
