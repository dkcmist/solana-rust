import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

import { systemProgram, tokenProgram, registryId, wrapperId, raydiumProgramId, serumProgramId, TESTTEST } from "./constant";
import { Registry, IDL as RegistryIDL } from "./types/registry";
import {
  WrapperRaydium,
  IDL as WrapperRaydiumIDL,
} from "./types/wrapper_raydium";
import registerKey from "./keys/register.json";
import executorKey from "./keys/executor.json";

async function main() {
  const connection = new anchor.web3.Connection(
    process.env.SOLANA_NETWORK || "https://api.devnet.solana.com"
  );

  const register = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(registerKey)
  );
  const executor = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(executorKey)
  );

  const wallet = new anchor.Wallet(register);
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  });
  anchor.setProvider(provider);

  const registry = new anchor.Program(
    RegistryIDL,
    registryId
  ) as Program<Registry>;
  const wrapper = new anchor.Program(
    WrapperRaydiumIDL,
    wrapperId
  ) as Program<WrapperRaydium>;

  const transaction = anchor.web3.Keypair.generate();

  const [registerStateKey, registerStateBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("register-state")],
      registry.programId
    );

  const registerState = await registry.account.registerState.fetch(
    registerStateKey
  );
  const requestId = registerState.nextRequestId;
  // const requestId = 0;
  console.log(requestId.toString());

  const [registerRequestKey, registerRequestBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        wallet.publicKey.toBuffer(),
        Buffer.from("register-request"),
        Buffer.from(requestId.toString()),
      ],
      registry.programId
    );

  const amountIn = new BN("1000000");
  const amountOutMin = new BN("10");
  const amountOutMax = new BN("10000000000");

  const raydiumProgram = new anchor.web3.PublicKey(raydiumProgramId);
  const serumProgram = new anchor.web3.PublicKey(serumProgramId);

  // only for USDT/USDC market
  const ammId = new anchor.web3.PublicKey(TESTTEST.ammId);

  // TEST to TEST
  const usdcTokenAccount = new anchor.web3.PublicKey(
    "EMSaLa72Z2mZiyJwMxSz5KhJ96gy1xHY3akSoAfjGmY2"
  );
  const usdtTokenAccount = new anchor.web3.PublicKey(
    "3b97KDmbuRNStWoT5256wkJru4imvSBQeLVtKA4dgLgb"
  );
  // USDT/USDC
  // const usdcTokenAccount = new anchor.web3.PublicKey(
  //   "7d7KX3vqivmHhArkCQfLZxkA7PynVM7qtdMKG1kBXxNX"
  // );
  // const usdtTokenAccount = new anchor.web3.PublicKey(
  //   "Hpyaf8Tsr4B1Dir5DJ4BAfHiymuLEH16UDFUaVa1pRbe"
  // );

  const [poolInfoKey, poolInfoBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("wrapper-pool-info"), ammId.toBuffer()],
      wrapper.programId
    );

  const accounts = (
    wrapper.instruction.swapTokens.accounts({
      signer: registerRequestKey,
      poolId: ammId,
      poolInfo: poolInfoKey,
      userSourceTokenAccount: usdtTokenAccount,
      userDestTokenAccount: usdcTokenAccount,
      tokenProgram,
      serumProgram,
      raydiumProgram
    }) as any
  ).map((meta: any) =>
    meta.pubkey.equals(registerRequestKey) ? { ...meta, isSigner: false } : meta
  );

  const data = wrapper.coder.instruction.encode("swap_tokens", {
    amountIn,
    minimumAmountOut: amountOutMin,
    maximumAmountOut: amountOutMax,
  });

  // const tx = new anchor.web3.Transaction().add(
  //   await Token.createApproveInstruction(
  //     TOKEN_PROGRAM_ID,
  //     usdtTokenAccount,
  //     registerRequestKey,
  //     wallet.publicKey,
  //     [],
  //     amountIn.toNumber()
  //   )
  // );

  // await anchor.web3.sendAndConfirmTransaction(connection, tx, [register]);

  await registry.rpc.registerExecution(
    registerStateBump,
    wrapper.programId,
    accounts,
    data,
    {
      accounts: {
        register: wallet.publicKey,
        registerState: registerStateKey,
        registerRequest: registerRequestKey,
        transaction: transaction.publicKey,
        systemProgram,
      },
      instructions: [
        await Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          usdtTokenAccount,
          registerRequestKey,
          wallet.publicKey,
          [],
          amountIn.toNumber()
        ),
        await registry.account.transaction.createInstruction(
          transaction,
          8 + 32 + 4 + (32 + 1 + 1) * accounts.length + 4 + data.length
        ),
      ],
      signers: [transaction],
    }
  );
}

main();
