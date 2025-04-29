import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import { IDL } from "./types/wrapper_raydium";
import executorKey from "./keys/executor.json";
import {
  systemProgram,
  tokenProgram,
  raydiumProgramId,
  routeSwapProgramId,
  serumProgramId,
  wrapperId,
  USDTUSDC,
  USDCRAY,
} from "./constant";

async function main() {
  const connection = new anchor.web3.Connection(
    "https://api.mainnet-beta.solana.com"
  );
  const executor = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(executorKey)
  );
  const wallet = new anchor.Wallet(executor);
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(IDL, wrapperId, provider);

  const fromPoolId = new anchor.web3.PublicKey(USDTUSDC.ammId);
  const toPoolId = new anchor.web3.PublicKey(USDCRAY.ammId);

  // usdt -> usdc -> ray
  const userSourceTokenAccount = new anchor.web3.PublicKey(
    "2vbsbLLb65LbqbQBKgS2HEwiUHsGoBWqzfTGa4T2RMLT"
  );
  const userMidTokenAccount = new anchor.web3.PublicKey(
    "4t6nLkbcWzTHTsriC2FK3ZyWcLytmNaDduZJeEJkfiZt"
  );
  const userDestTokenAccount = new anchor.web3.PublicKey(
    "8WQrLgJfLYXwPpY9e8HuVA3grdrq8YLGZwqiBkSdTQKc"
  );

  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  const [userSwapPdaAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [
      new anchor.web3.PublicKey(USDTUSDC.ammId).toBuffer(),
      new anchor.web3.PublicKey(USDC_MINT).toBuffer(),
      wallet.publicKey.toBuffer(),
    ],
    new anchor.web3.PublicKey(routeSwapProgramId)
  );

  const [fromPoolInfoKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("wrapper-pool-info"), fromPoolId.toBuffer()],
    program.programId
  );
  const fromPoolInfo: any = await program.account.poolInfo.fetch(
    fromPoolInfoKey
  );

  const [toPoolInfoKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("wrapper-pool-info"), toPoolId.toBuffer()],
    program.programId
  );
  const toPoolInfo: any = await program.account.poolInfo.fetch(toPoolInfoKey);

  const swapInRemainingAccounts = Object.keys(fromPoolInfo).map((key) => ({
    pubkey: fromPoolInfo[key],
    isWritable: true,
    isSigner: false,
  }));
  const swapOutRemainingAccount = Object.keys(toPoolInfo).map((key) => ({
    pubkey: toPoolInfo[key],
    isWritable: true,
    isSigner: false,
  }));

  const amountIn = new BN("1000000");
  const amountOutMin = new BN("284000");
  const amountOutMax = new BN("284100");

  await program.rpc.swapTokensBaseIn(amountIn, {
    accounts: {
      signer: wallet.publicKey,
      fromPoolId,
      fromPoolInfo: fromPoolInfoKey,
      toPoolId,
      // toPoolInfo: toPoolInfoKey,
      userSourceTokenAccount,
      userMidTokenAccount,
      // userDestTokenAccount,
      userSwapPdaAccount,
      tokenProgram,
      serumProgram: new anchor.web3.PublicKey(serumProgramId),
      raydiumProgram: new anchor.web3.PublicKey(raydiumProgramId),
      routeSwapProgram: new anchor.web3.PublicKey(routeSwapProgramId),
      systemProgram,
    },
    remainingAccounts: swapInRemainingAccounts,
    signers: [],
  });

  // await program.rpc.swapTokensBaseOut(amountOutMin, amountOutMax, {
  //   accounts: {
  //     signer: wallet.publicKey,
  //     fromPoolId,
  //     // fromPoolInfo: fromPoolInfoKey,
  //     toPoolId,
  //     toPoolInfo: toPoolInfoKey,
  //     // userSourceTokenAccount,
  //     userMidTokenAccount,
  //     userDestTokenAccount,
  //     userSwapPdaAccount,
  //     tokenProgram,
  //     serumProgram: new anchor.web3.PublicKey(serumProgramId),
  //     raydiumProgram: new anchor.web3.PublicKey(raydiumProgramId),
  //     routeSwapProgram: new anchor.web3.PublicKey(routeSwapProgramId),
  //     systemProgram,
  //   },
  //   remainingAccounts: swapOutRemainingAccount,
  //   signers: [],
  // });
}

main();
