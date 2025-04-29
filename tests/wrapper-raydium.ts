import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { WrapperRaydium, IDL } from "../target/types/wrapper_raydium";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import assert from "assert";
// @ts-ignore
import { nu64, struct, u8 } from "buffer-layout";

const WRAPPER_PROGRAM_ID = "y6uN6sB6AUtd7GfkW36c7A1W335pQWawLaZJUU9PmJr";
const systemProgram = anchor.web3.SystemProgram.programId;

export const getTokenBalance = async (provider, pubkey) => {
  return parseInt(
    (await provider.connection.getTokenAccountBalance(pubkey)).value.amount
  );
};

describe("wrapper-raydium-program", () => {
  const preflightCommitment = "recent";
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    preflightCommitment
  );
  const wallet = anchor.Wallet.local();

  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment,
    commitment: "recent",
  });

  anchor.setProvider(provider);

  // const program = anchor.workspace.WrapperRaydium as Program<WrapperRaydium>;
  const program = new anchor.Program(IDL, WRAPPER_PROGRAM_ID, provider);

  let mintA: Token = null;
  let mintB: Token = null;
  let lpMint: Token = null;
  let swapTokenAccountA: PublicKey = null;
  let swapTokenAccountB: PublicKey = null;
  // let reserveTokenAccountA: PublicKey = null;
  // let reserveTokenAccountB: PublicKey = null;
  // let poolTokenAccountA: PublicKey = null;
  // let poolTokenAccountB: PublicKey = null;
  // let userLpAccount: PublicKey = null;

  // const reserveA = 100000;
  // const reserveB = 200000;
  const amount = 10000000;

  const payer = wallet.payer;
  const mintAuthority = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array([
      126, 218, 91, 206, 170, 129, 224, 44, 74, 68, 87, 211, 125, 45, 7, 198,
      94, 231, 152, 88, 34, 136, 164, 192, 128, 193, 34, 233, 81, 123, 183, 57,
      46, 183, 53, 172, 18, 161, 72, 81, 251, 126, 133, 235, 247, 180, 254, 81,
      87, 40, 41, 88, 141, 85, 112, 158, 238, 230, 161, 11, 250, 198, 179, 133,
    ])
  );
  const mainAccount = anchor.web3.Keypair.generate();

  it("Initialize program state", async () => {
    // Airdropping tokens to a payer.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(payer.publicKey, 10000000000),
      "confirmed"
    );

    // Fund Main Accounts
    await provider.send(
      (() => {
        const tx = new Transaction();
        tx.add(
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: mainAccount.publicKey,
            lamports: 100000000,
          })
        );
        return tx;
      })(),
      [payer]
    );

    // mintA = await Token.createMint(
    //   provider.connection,
    //   payer,
    //   mintAuthority.publicKey,
    //   null,
    //   0,
    //   TOKEN_PROGRAM_ID
    // );

    // mintB = await Token.createMint(
    //   provider.connection,
    //   payer,
    //   mintAuthority.publicKey,
    //   null,
    //   0,
    //   TOKEN_PROGRAM_ID
    // );

    // lpMint = await Token.createMint(
    //   provider.connection,
    //   payer,
    //   new anchor.web3.PublicKey(RAYDIUM_AMM_AUTHORITY),
    //   null,
    //   0,
    //   TOKEN_PROGRAM_ID
    // );

    mintA = new Token(
      provider.connection,
      new anchor.web3.PublicKey("BEcGFQK1T1tSu3kvHC17cyCkQ5dvXqAJ7ExB2bb5Do7a"),
      TOKEN_PROGRAM_ID,
      mainAccount
    );
    mintB = new Token(
      provider.connection,
      new anchor.web3.PublicKey("FSRvxBNrQWX2Fy2qvKMLL3ryEdRtE3PUTZBcdKwASZTU"),
      TOKEN_PROGRAM_ID,
      mainAccount
    );
    lpMint = new Token(
      provider.connection,
      new anchor.web3.PublicKey("14Wp3dxYTQpRMMz3AW7f2XGBTdaBrf1qb2NKjAN3Tb13"),
      TOKEN_PROGRAM_ID,
      mainAccount
    );

    // reserveTokenAccountA = await mintA.createAccount(mainAccount.publicKey);
    // reserveTokenAccountB = await mintB.createAccount(mainAccount.publicKey);
    swapTokenAccountA = await mintA.createAccount(mainAccount.publicKey);
    swapTokenAccountB = await mintB.createAccount(mainAccount.publicKey);
    // poolTokenAccountA = await mintA.createAccount(mainAccount.publicKey);
    // poolTokenAccountB = await mintB.createAccount(mainAccount.publicKey);
    // userLpAccount = await lpMint.createAccount(mainAccount.publicKey);

    // await mintA.mintTo(
    //   reserveTokenAccountA,
    //   mintAuthority.publicKey,
    //   [mintAuthority],
    //   reserveA
    // );

    await mintA.mintTo(
      swapTokenAccountA,
      mintAuthority.publicKey,
      [mintAuthority],
      amount
    );

    // await mintB.mintTo(
    //   reserveTokenAccountB,
    //   mintAuthority.publicKey,
    //   [mintAuthority],
    //   reserveB
    // );

    // let _reserveTokenAccountA = await mintA.getAccountInfo(reserveTokenAccountA);
    // let _reserveTokenAccountB = await mintB.getAccountInfo(reserveTokenAccountB);
    let _swapTokenAccountA = await mintA.getAccountInfo(swapTokenAccountA);

    // assert.ok(_reserveTokenAccountA.amount.toNumber() == reserveA);
    // assert.ok(_reserveTokenAccountB.amount.toNumber() == reserveB);
    assert.ok(_swapTokenAccountA.amount.toNumber() == amount);
  });

  // it('Initialize Raydium', async () => {
  //   const dataLayout = struct([u8('instruction'), u8('nonce')]);

  //   const data = Buffer.alloc(dataLayout.span);
  //   dataLayout.encode({
  //     instruction: 0,
  //     nonce: 1,
  //   }, data);

  //   const keys = [
  //     // spl token
  //     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  //     // amm
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_ID), isSigner: false, isWritable: true },
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_AUTHORITY), isSigner: false, isWritable: false },
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_OPEN_ORDERS), isSigner: false, isWritable: false },
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_TARGET_ORDERS), isSigner: false, isWritable: true },
  //     { pubkey: lpMint.publicKey, isSigner: false, isWritable: true },
  //     { pubkey: poolTokenAccountA, isSigner: false, isWritable: true },
  //     { pubkey: poolTokenAccountB, isSigner: false, isWritable: true },
  //     // serum
  //     { pubkey: new anchor.web3.PublicKey(SERUM_MARKET), isSigner: false, isWritable: false },
  //     // user
  //     { pubkey: reserveTokenAccountA, isSigner: false, isWritable: true },
  //     { pubkey: reserveTokenAccountB, isSigner: false, isWritable: true },
  //     { pubkey: userLpAccount, isSigner: false, isWritable: true },
  //     { pubkey: mainAccount.publicKey, isSigner: true, isWritable: false }
  //   ]

  //   const tx = new anchor.web3.Transaction({
  //     feePayer: mainAccount.publicKey
  //   }).add(
  //     new anchor.web3.TransactionInstruction({
  //       programId: new anchor.web3.PublicKey(RAYDIUM_AMM_PROGRAM_ID),
  //       keys,
  //       data
  //     })
  //   );

  //   await anchor.web3.sendAndConfirmTransaction(connection, tx, [ mainAccount ]);
  // });

  // it('Add liquidity to raydium', async () => {
  //   const dataLayout = struct([u8('instruction'), nu64('max_coin_amount'), nu64('max_pc_amount'), nu64('base_side')]);

  //   const data = Buffer.alloc(dataLayout.span);
  //   dataLayout.encode({
  //     instruction: 3,
  //     max_coin_amount: reserveA,
  //     max_pc_amount: reserveB,
  //     base_side: 0
  //   }, data);

  //   const keys = [
  //     // spl token
  //     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  //     // amm
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_ID), isSigner: false, isWritable: true },
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_AUTHORITY), isSigner: false, isWritable: false },
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_OPEN_ORDERS), isSigner: false, isWritable: false },
  //     { pubkey: new anchor.web3.PublicKey(RAYDIUM_AMM_TARGET_ORDERS), isSigner: false, isWritable: true },
  //     { pubkey: lpMint.publicKey, isSigner: false, isWritable: true },
  //     { pubkey: poolTokenAccountA, isSigner: false, isWritable: true },
  //     { pubkey: poolTokenAccountB, isSigner: false, isWritable: true },
  //     // serum
  //     { pubkey: new anchor.web3.PublicKey(SERUM_MARKET), isSigner: false, isWritable: false },
  //     // user
  //     { pubkey: reserveTokenAccountA, isSigner: false, isWritable: true },
  //     { pubkey: reserveTokenAccountB, isSigner: false, isWritable: true },
  //     { pubkey: userLpAccount, isSigner: false, isWritable: true },
  //     { pubkey: mainAccount.publicKey, isSigner: true, isWritable: false }
  //   ]

  //   const tx = new anchor.web3.Transaction({
  //     feePayer: mainAccount.publicKey
  //   }).add(
  //     new anchor.web3.TransactionInstruction({
  //       programId: new anchor.web3.PublicKey(RAYDIUM_AMM_PROGRAM_ID),
  //       keys,
  //       data
  //     })
  //   );

  //   await anchor.web3.sendAndConfirmTransaction(connection, tx, [ mainAccount ]);
  // });

  let wrapperStateAccountKey;
  let wrapperStateBump;

  it("Initialize", async () => {
    [wrapperStateAccountKey, wrapperStateBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("wrapper-state")],
        program.programId
      );

    try {
      await program.account.wrapperState.fetch(wrapperStateAccountKey);
    } catch {
      await program.rpc.initialize(wrapperStateBump, {
        accounts: {
          signer: payer.publicKey,
          wrapperState: wrapperStateAccountKey,
          systemProgram,
        },
      });
    }
  });

  it("Swap assets via wrapper", async () => {
    const raydiumProgram = new anchor.web3.PublicKey(
      "9rpQHSyFVM1dkkHFQ2TtTzPEW7DVmEyPmN8wVniqJtuC"
    );

    // only for USDT/USDC market
    const ammId = new anchor.web3.PublicKey(
      "HeD1cekRWUNR25dcvW8c9bAHeKbr1r7qKEhv7pEegr4f"
    );
    const ammAuthority = new anchor.web3.PublicKey(
      "DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh"
    );
    const ammOpenOrders = new anchor.web3.PublicKey(
      "HboQAt9BXyejnh6SzdDNTx4WELMtRRPCr7pRSLpAW7Eq"
    );
    const ammTargetOrders = new anchor.web3.PublicKey(
      "6TzAjFPVZVMjbET8vUSk35J9U2dEWFCrnbHogsejRE5h"
    );
    const coinTokenAccount = new anchor.web3.PublicKey(
      "3qbeXHwh9Sz4zabJxbxvYGJc57DZHrFgYMCWnaeNJENT"
    );
    const pcTokenAccount = new anchor.web3.PublicKey(
      "FrGPG5D4JZVF5ger7xSChFVFL8M9kACJckzyCz8tVowz"
    );

    const serumProgramId = new anchor.web3.PublicKey(
      "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY"
    );
    const serumMarket = new anchor.web3.PublicKey(
      "3tsrPhKrWHWMB8RiPaqNxJ8GnBhZnDqL4wcu5EAMFeBe"
    );
    const serumBids = new anchor.web3.PublicKey(
      "ANHHchetdZVZBuwKWgz8RSfVgCDsRpW9i2BNWrmG9Jh9"
    );
    const serumAsks = new anchor.web3.PublicKey(
      "ESSri17GNbVttqrp7hrjuXtxuTcCqytnrMkEqr29gMGr"
    );
    const serumEventQueue = new anchor.web3.PublicKey(
      "FGAW7QqNJGFyhakh5jPzGowSb8UqcSJ95ZmySeBgmVwt"
    );
    const serumCoinVaultAccount = new anchor.web3.PublicKey(
      "E1E5kQqWXkXbaqVzpY5P2EQUSi8PNAHdCnqsj3mPWSjG"
    );
    const serumPcVaultAccount = new anchor.web3.PublicKey(
      "3sj6Dsw8fr8MseXpCnvuCSczR8mQjCWNyWDC5cAfEuTq"
    );
    const serumVaultSigner = new anchor.web3.PublicKey(
      "C2fDkZJqHH5PXyQ7UWBNZsmu6vDXxrEbb9Ex9KF7XsAE"
    );

    // add poolInfo
    const [poolInfoAccountKey, poolInfoAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("wrapper-pool-info"), ammId.toBuffer()],
        program.programId
      );

    // try {
    //   await program.account.poolInfo.fetch(poolInfoAccountKey);
    // } catch {
    //   await program.rpc.addPoolInfo(
    //     {
    //       amm: ammId,
    //       ammAuthority,
    //       ammOpenOrders,
    //       ammTargetOrders,
    //       poolCoinTokenAccount: coinTokenAccount,
    //       poolPcTokenAccount: pcTokenAccount,
    //       serumMarket,
    //       serumBids,
    //       serumAsks,
    //       serumEventQue: serumEventQueue,
    //       serumCoinVaultAccount,
    //       serumPcVaultAccount,
    //       serumVaultSigner,
    //     },
    //     {
    //       accounts: {
    //         signer: payer.publicKey,
    //         wrapperState: wrapperStateAccountKey,
    //         poolInfo: poolInfoAccountKey,
    //         systemProgram,
    //       },
    //     }
    //   );
    // }

    await program.rpc.updatePoolInfo(
      {
        amm: ammId,
        ammAuthority,
        ammOpenOrders,
        ammTargetOrders,
        poolCoinTokenAccount: coinTokenAccount,
        poolPcTokenAccount: pcTokenAccount,
        serumMarket,
        serumBids,
        serumAsks,
        serumEventQue: serumEventQueue,
        serumCoinVaultAccount,
        serumPcVaultAccount,
        serumVaultSigner,
      },
      {
        accounts: {
          signer: payer.publicKey,
          wrapperState: wrapperStateAccountKey,
          poolInfo: poolInfoAccountKey,
          systemProgram,
        },
      }
    );

    const poolInfo = await program.account.poolInfo.fetch(poolInfoAccountKey);
    console.log("poolInfo", poolInfo);
    const remainingAccounts = Object.keys(poolInfo).map((key) => ({
      pubkey: poolInfo[key],
      isWritable: true,
      isSigner: false,
    }));

    console.log("remainingAccounts", remainingAccounts);

    const reserveA = await getTokenBalance(provider, coinTokenAccount);
    const reserveB = await getTokenBalance(provider, pcTokenAccount);
    console.log(reserveA);
    console.log(reserveB);

    const amountIn = await getTokenBalance(provider, swapTokenAccountA);
    const amountOutMin = ((amountIn * reserveB) / reserveA) * 0.9;
    const amountOutMax = ((amountIn * reserveB) / reserveA) * 1.1;
    const amountOutMaxErr = ((amountIn * reserveB) / reserveA) * 0.1;

    // await assert.rejects(async () => {
    //   await program.rpc.swapTokens(
    //     new BN(amountIn),
    //     new BN(amountOutMin),
    //     new BN(amountOutMaxErr),
    //     {
    //       accounts: {
    //         tokenProgram: new anchor.web3.PublicKey(TOKEN_PROGRAM_ID),
    //         amm: ammId,
    //         ammAuthority,
    //         ammOpenOrders,
    //         ammTargetOrders,
    //         poolCoinTokenAccount: coinTokenAccount,
    //         poolPcTokenAccount: pcTokenAccount,
    //         serumProgram: serumProgramId,
    //         serumMarket,
    //         serumBids,
    //         serumAsks,
    //         serumEventQue: serumEventQueue,
    //         serumCoinVaultAccount,
    //         serumPcVaultAccount,
    //         serumVaultSigner,
    //         userSourceTokenAccount: swapTokenAccountA,
    //         userDestTokenAccount: swapTokenAccountB,
    //         userOwner: mainAccount.publicKey,
    //         raydiumProgram,
    //       },
    //       signers: [mainAccount],
    //     }
    //   );
    // });

    // console.log(await getTokenBalance(provider, swapTokenAccountA));
    // console.log(await getTokenBalance(provider, swapTokenAccountB));

    // await program.rpc.swapTokens(
    //   new BN(amountIn),
    //   new BN(amountOutMin),
    //   new BN(amountOutMax),
    //   {
    //     accounts: {
    //       tokenProgram: new anchor.web3.PublicKey(TOKEN_PROGRAM_ID),
    //       amm: ammId,
    //       ammAuthority,
    //       ammOpenOrders,
    //       ammTargetOrders,
    //       poolCoinTokenAccount: coinTokenAccount,
    //       poolPcTokenAccount: pcTokenAccount,
    //       serumProgram: serumProgramId,
    //       serumMarket,
    //       serumBids,
    //       serumAsks,
    //       serumEventQue: serumEventQueue,
    //       serumCoinVaultAccount,
    //       serumPcVaultAccount,
    //       serumVaultSigner,
    //       userSourceTokenAccount: swapTokenAccountA,
    //       userDestTokenAccount: swapTokenAccountB,
    //       userOwner: mainAccount.publicKey,
    //       raydiumProgram,
    //     },
    //     signers: [mainAccount],
    //   }
    // );

    await program.rpc.swapTokens(
      new BN(amountIn),
      new BN(amountOutMin),
      new BN(amountOutMax),
      {
        accounts: {
          signer: mainAccount.publicKey,
          poolId: ammId,
          poolInfo: poolInfoAccountKey,
          userSourceTokenAccount: swapTokenAccountA,
          userDestTokenAccount: swapTokenAccountB,
          tokenProgram: new anchor.web3.PublicKey(TOKEN_PROGRAM_ID),
          serumProgram: serumProgramId,
          raydiumProgram,
        },
        remainingAccounts,
        signers: [mainAccount],
      }
    );

    console.log(await getTokenBalance(provider, swapTokenAccountA));
    console.log(await getTokenBalance(provider, swapTokenAccountB));
  });
});
