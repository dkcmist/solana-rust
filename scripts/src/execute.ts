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

  const requestId = 13;
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

  const poolInfo: any = await wrapper.account.poolInfo.fetch(poolInfoKey);
  const poolRemainingAccounts = Object.keys(poolInfo).map((key) => ({
      pubkey: poolInfo[key],
      isWritable: true,
      isSigner: false,
    }));
  const remainingAccounts = poolRemainingAccounts.concat(accounts);

  const [globalStateKey, globalStateBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("global-state")],
      registry.programId
    );

  const registerRequest = await registry.account.registerRequest.fetch(registerRequestKey);
  const fees = "SysvarFees111111111111111111111111111111111";

  await registry.rpc.execute(
    globalStateBump,
    registerRequestBump,
    new anchor.BN(requestId),
    {
      accounts: {
        executionAuthority: register.publicKey,
        globalState: globalStateKey,
        register: register.publicKey,
        registerRequest: registerRequestKey,
        transaction: registerRequest.transaction,
        fees,
        systemProgram,
      },
      remainingAccounts: remainingAccounts.concat({
        pubkey: wrapper.programId,
        isWritable: false,
        isSigner: false,
      }),
      signers: [executor],
    }
  );
}

main();
