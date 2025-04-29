import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { Registry } from "../target/types/registry";
import { WrapperTest } from "./../target/types/wrapper_test";
import assert from "assert";

const systemProgram = anchor.web3.SystemProgram.programId;
const fees = "SysvarFees111111111111111111111111111111111";

describe("registry", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Registry as Program<Registry>;
  const wrapper = anchor.workspace.WrapperTest as Program<WrapperTest>;
  const provider = anchor.getProvider();

  const initializer = anchor.web3.Keypair.generate();
  const executor = anchor.web3.Keypair.generate();
  const register = anchor.web3.Keypair.generate();
  const receiver = anchor.web3.Keypair.generate();

  let registerTokenAccount: anchor.web3.PublicKey;
  let receiverTokenAccount: anchor.web3.PublicKey;
  let mint: Token;
  const amount = 1000;

  let globalStateKey: anchor.web3.PublicKey;
  let globalStateBump: number;

  let registerStateKey: anchor.web3.PublicKey;
  let registerStateBump: number;

  let registerRequestKey: anchor.web3.PublicKey;
  let registerRequestBump: number;

  let transaction = anchor.web3.Keypair.generate();
  let txSize = 1000; // Big enough, cuz I'm lazy.

  const requestId = 0;

  // let messageFromEvent: Buffer;

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        initializer.publicKey,
        10000000000
      ),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(executor.publicKey, 10000000000),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(register.publicKey, 10000000000),
      "confirmed"
    );

    [globalStateKey, globalStateBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("global-state")],
        program.programId
      );

    [registerStateKey, registerStateBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [register.publicKey.toBuffer(), Buffer.from("register-state")],
        program.programId
      );

    mint = await Token.createMint(
      provider.connection,
      initializer,
      initializer.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    registerTokenAccount = await mint.createAccount(register.publicKey);
    receiverTokenAccount = await mint.createAccount(receiver.publicKey);
    await mint.mintTo(registerTokenAccount, initializer, [], amount);

    program.addEventListener("Register", (e, s) => {
      console.log("New Register In Slot ", s);
      console.log("Event", e);
    });
  });

  it("Is initialized!", async () => {
    await program.rpc.initialize(globalStateBump, {
      accounts: {
        initializer: initializer.publicKey,
        globalState: globalStateKey,
        systemProgram,
      },
      signers: [initializer],
    });

    const globalState = await program.account.globalState.fetch(globalStateKey);
    assert.ok(globalState.mainAuthority.equals(initializer.publicKey));
  });

  it("SetExecutionAuthority", async () => {
    await program.rpc.setExecutionAuthority(
      globalStateBump,
      executor.publicKey,
      {
        accounts: {
          mainAuthority: initializer.publicKey,
          globalState: globalStateKey,
        },
        signers: [initializer],
      }
    );
    const globalState = await program.account.globalState.fetch(globalStateKey);
    assert.ok(globalState.executionAuthority.equals(executor.publicKey));
  });

  it("RegisterExecution", async () => {
    [registerRequestKey, registerRequestBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          register.publicKey.toBuffer(),
          Buffer.from("register-request"),
          Buffer.from(requestId.toString()),
        ],
        program.programId
      );

    const pid = wrapper.programId;
    // const accounts = [
    //   {
    //     pubkey: registerTokenAccount,
    //     isWritable: true,
    //     isSigner: false,
    //   },
    //   {
    //     pubkey: receiverTokenAccount,
    //     isWritable: true,
    //     isSigner: false,
    //   },
    //   {
    //     pubkey: registerRequestKey,
    //     isWritable: true,
    //     isSigner: true,
    //   },
    //   {
    //     pubkey: TOKEN_PROGRAM_ID,
    //     isWritable: false,
    //     isSigner: false,
    //   },
    // ];
    const accounts = (
      wrapper.instruction.transferTokens.accounts({
        from: registerTokenAccount,
        to: receiverTokenAccount,
        authority: registerRequestKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      }) as any
    ).map((meta) =>
      meta.pubkey.equals(registerRequestKey)
        ? { ...meta, isSigner: false }
        : meta
    );
    const data = wrapper.coder.instruction.encode("transfer_tokens", {
      amount: new BN(1000),
    });

    await program.rpc.registerExecution(
      registerStateBump,
      pid,
      accounts,
      data,
      {
        accounts: {
          register: register.publicKey,
          registerState: registerStateKey,
          registerRequest: registerRequestKey,
          transaction: transaction.publicKey,
          systemProgram,
        },
        instructions: [
          await Token.createApproveInstruction(
            TOKEN_PROGRAM_ID,
            registerTokenAccount,
            registerRequestKey,
            register.publicKey,
            [],
            amount
          ),
          await program.account.transaction.createInstruction(
            transaction,
            txSize
          ),
        ],
        signers: [transaction, register],
      }
    );

    const registerState = await program.account.registerState.fetch(
      registerStateKey
    );
    assert.ok(registerState.nextRequestId.eq(new BN(requestId + 1)));

    const registerRequest = await program.account.registerRequest.fetch(
      registerRequestKey
    );
    assert.ok(registerRequest.transaction.equals(transaction.publicKey));

    const txAccount = await program.account.transaction.fetch(
      transaction.publicKey
    );

    assert.ok(txAccount.programId.equals(pid));
    assert.deepStrictEqual(txAccount.accounts, accounts);
    assert.deepStrictEqual(txAccount.data, data);
  });

  it("Execution", async () => {
    const tx = await program.account.transaction.fetch(transaction.publicKey);
    await program.rpc.execute(
      globalStateBump,
      registerRequestBump,
      new BN(requestId),
      {
        accounts: {
          executionAuthority: executor.publicKey,
          globalState: globalStateKey,
          register: register.publicKey,
          registerRequest: registerRequestKey,
          transaction: transaction.publicKey,
          fees,
          systemProgram,
        },
        remainingAccounts: [...(tx.accounts as any)].concat({
          pubkey: wrapper.programId,
          isWritable: false,
          isSigner: false,
        }),
        //   wrapper.instruction.transferTokens.accounts({
        //     from: registerTokenAccount,
        //     to: receiverTokenAccount,
        //     authority: registerRequestKey,
        //     tokenProgram: TOKEN_PROGRAM_ID,
        //   }) as any
        // )
        //   .map((meta) =>
        //     meta.pubkey.equals(registerRequestKey)
        //       ? { ...meta, isSigner: false }
        //       : meta
        //   )

        signers: [executor],
      }
    );

    let registerTokenAccountInfo = await mint.getAccountInfo(
      registerTokenAccount
    );
    let receiverTokenAccountInfo = await mint.getAccountInfo(
      receiverTokenAccount
    );
    assert.ok(registerTokenAccountInfo.amount.toNumber() == 0);
    assert.ok(receiverTokenAccountInfo.amount.toNumber() == amount);
  });
});
