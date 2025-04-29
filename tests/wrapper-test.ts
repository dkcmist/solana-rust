import * as anchor from '@project-serum/anchor';
import { BN, Program } from '@project-serum/anchor';
import { WrapperTest } from '../target/types/wrapper_test';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { assert } from "chai";

describe('wrapper-test-program', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.WrapperTest as Program<WrapperTest>;
  const provider = anchor.getProvider();

  let mint = null;
  let fromTokenAccount = null;
  let toTokenAccount = null;

  const amount = 1000;

  const payer = anchor.web3.Keypair.generate();
  const mintAuthority = anchor.web3.Keypair.generate();
  const fromMainAccount = anchor.web3.Keypair.generate();
  const toMainAccount = anchor.web3.Keypair.generate();

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
            toPubkey: fromMainAccount.publicKey,
            lamports: 1000000000,
          }),
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: toMainAccount.publicKey,
            lamports: 1000000000,
          })
        );
        return tx;
      })(),
      [payer]
    );

    mint = await Token.createMint(
      provider.connection,
      payer,
      mintAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    fromTokenAccount = await mint.createAccount(fromMainAccount.publicKey);
    toTokenAccount = await mint.createAccount(toMainAccount.publicKey);

    await mint.mintTo(
      fromTokenAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      amount
    );

    let _fromTokenAccount = await mint.getAccountInfo(fromTokenAccount);

    assert.ok(_fromTokenAccount.amount.toNumber() == amount);
  });

  it('transfer spl tokens', async () => {
    const tx = await program.rpc.transferTokens(
      new BN(amount),
      {
        accounts: {
          from: fromTokenAccount,
          to: toTokenAccount,
          authority: fromMainAccount.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [fromMainAccount],
      }
    );
    let _fromTokenAccount = await mint.getAccountInfo(fromTokenAccount);
    let _toTokenAccount = await mint.getAccountInfo(toTokenAccount);

    assert.ok(_fromTokenAccount.amount.toNumber() == 0);
    assert.ok(_toTokenAccount.amount.toNumber() == amount);
  });
});
