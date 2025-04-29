import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";

import {
  rent,
  clock,
  systemProgram,
  tokenProgram,
  wrapperId,
  raydiumProgramId,
  TESTTEST,
  serumProgramId
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

  const amountIn = new BN("1000000");
  const amountOutMin = new BN("0");
  const amountOutMax = new BN("1000000000");

  const raydiumProgram = new anchor.web3.PublicKey(raydiumProgramId);
  const serumProgram = new anchor.web3.PublicKey(serumProgramId);

  // only for USDT/USDC market
  const ammId = new anchor.web3.PublicKey(TESTTEST.ammId);

  const usdcTokenAccount = new anchor.web3.PublicKey(
    "EMSaLa72Z2mZiyJwMxSz5KhJ96gy1xHY3akSoAfjGmY2"
  );
  const usdtTokenAccount = new anchor.web3.PublicKey(
    "3b97KDmbuRNStWoT5256wkJru4imvSBQeLVtKA4dgLgb"
  );

  const [poolInfoKey, poolInfoBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("wrapper-pool-info"), ammId.toBuffer()],
      wrapper.programId
    );

  const poolInfo: any = await wrapper.account.poolInfo.fetch(poolInfoKey);
  console.log("poolInfo", poolInfo);
  const remainingAccounts = Object.keys(poolInfo).map((key) => ({
      pubkey: poolInfo[key],
      isWritable: true,
      isSigner: false,
    }));

  await wrapper.rpc.swapTokens(amountIn, amountOutMin, amountOutMax, {
    accounts: {
      signer: initializer.publicKey,
      poolId: ammId,
      poolInfo: poolInfoKey,
      userSourceTokenAccount: usdtTokenAccount,
      userDestTokenAccount: usdcTokenAccount,
      tokenProgram,
      serumProgram,
      raydiumProgram
    },
    remainingAccounts,
    signers: [initializer]
  });
}

main();
