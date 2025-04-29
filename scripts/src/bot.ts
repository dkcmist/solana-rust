import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Registry, IDL as RegistryIDL } from "./types/registry";
import { registryId, wrapperId } from "./constant";
import executorKey from "./keys/executor.json";
import { WrapperRaydium, IDL as WrapperRaydiumIDL } from "./types/wrapper_raydium";
import { ConfirmedSignatureInfo, SignaturesForAddressOptions, TransactionSignature } from "@solana/web3.js";

const systemProgram = anchor.web3.SystemProgram.programId;
const fees = "SysvarFees111111111111111111111111111111111";

async function main() {
  const connection = new anchor.web3.Connection(
    process.env.SOLANA_NETWORK || "https://api.devnet.solana.com"
  );

  const executor = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(executorKey)
  );

  const wallet = new anchor.Wallet(executor);
  const provider = new anchor.Provider(
    connection,
    wallet,
    {
      preflightCommitment: "recent",
      commitment: "recent",
    }
  );
  anchor.setProvider(provider);

  const registry = new anchor.Program(
    RegistryIDL,
    registryId
  ) as Program<Registry>;
  const wrapper = new anchor.Program(
    WrapperRaydiumIDL,
    wrapperId
  ) as Program<WrapperRaydium>;

  const [globalStateKey, globalStateBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("global-state")],
      registry.programId
    );

  // Custom helper to filter requests
  const isExecutedOrCancelled = async (event: anchor.Event) => {
    const register = event.data.register as anchor.web3.PublicKey;
    const requestId = event.data.requestId as anchor.BN;
    const [registerRequestKey, registerRequestBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          register.toBuffer(),
          Buffer.from("register-request"),
          Buffer.from(requestId.toString()),
        ],
        registry.programId
      );
      try {
        await registry.account.registerRequest.fetch(
          registerRequestKey
        );
      } catch {
        return true;
      }
      return false;
  }

  /**********************************************/
  const allEvents: anchor.Event[] = [];
  let lastSignature = "";
  /**********************************************/

  const isEventInArray = (event: anchor.Event) => {
    return (allEvents.findIndex((e) => (
      (e.data.requestId as anchor.BN).eq(event.data.requestId as anchor.BN)) && 
      (e.data.register as anchor.web3.PublicKey).equals(event.data.register as anchor.web3.PublicKey)) > -1)
  }

  const scanAllReqeusts = async (until: string): Promise<string> => {
    console.log("Scanning requests after", until);
    const txs: (anchor.web3.ParsedConfirmedTransaction | null)[] = [];
    const options: SignaturesForAddressOptions = {};
    if (until?.length > 0) {
      options.until = until;
    }
    while(true) {
      const signatureInfos: Array<ConfirmedSignatureInfo> = await connection.getSignaturesForAddress(
        new anchor.web3.PublicKey(registryId),
        options
      );
      const signatures = signatureInfos.map((el) => el.signature);
      const txns = await connection.getParsedConfirmedTransactions(signatures);
      txs.push(...txns);
      if (signatures.length < 1000) {
        break;
      }
      options.before = signatures[999];
    }
  
    for (let i = 0; i < txs.length; i++) {
      /**
       * We identify requests by signature length and logMessages length
       * singatures length must be 3
       * logMessages length is 
       * 
       *  - 39 if this is the first request, request id is zero, then registerState is inited so more logs 
       *  - 20 if this is not the first request
       *
       * and the register event log index is
       * 
       *  - 36 if request id is zero
       *  - 17 if request id is above zero
       * 
       */
      if (txs[i]?.transaction.signatures.length != 3) {
        continue
      }
      if (txs[i]?.meta?.logMessages?.length != 20 && txs[i]?.meta?.logMessages?.length != 39) {
        continue
      }
      const registerLogIndex = txs[i]?.meta?.logMessages?.length as number - 3;
      // @ts-ignore
      const registerLog = txs[i]?.meta?.logMessages[registerLogIndex];
      // console.log(registerLog!.slice(13));
      const event = registry.coder.events.decode(registerLog!.slice(13));
      // console.log(event);
      if (event == null) {
        continue;
      }
      console.log((event.data.requestId as anchor.BN).toString(), (event.data.register as anchor.web3.PublicKey).toBase58(), txs[i]?.transaction.signatures[0]);
      if (!(await isExecutedOrCancelled(event)) && !isEventInArray(event)) {
        allEvents.push(event);
      } else {
        console.log(`Request #${(event.data.requestId as anchor.BN).toString()} of ${(event.data.register as anchor.web3.PublicKey).toBase58()} is already executed or cancelled`);
      }
    }
    // @ts-ignore
    return txs[0]?.transaction.signatures[0];
  }

  const executeRequests = async () => {
    for (let i = allEvents.length - 1; i >= 0; i -= 1) {
      const event = allEvents[i];
      const register = event.data.register as anchor.web3.PublicKey;
      const requestId = event.data.requestId as anchor.BN;

      if ((await isExecutedOrCancelled(event)) == true) {
        allEvents.splice(i, 1);
        console.log(`Request #${(event.data.requestId as anchor.BN).toString()} of ${(event.data.register as anchor.web3.PublicKey).toBase58()} is executed or cancelled`);
        continue;
      }

      const [registerRequestKey, registerRequestBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            register.toBuffer(),
            Buffer.from("register-request"),
            Buffer.from(requestId.toString()),
          ],
          registry.programId
        );
      const registerRequest = await registry.account.registerRequest.fetch(registerRequestKey);
  
      try {
        const accounts = [...(event.data.accounts as any)];
        let remainingAccounts: any[] = [];

        // Raydium Wrapper
        if ((event.data.programId as anchor.web3.PublicKey).equals(new anchor.web3.PublicKey(wrapperId))) {
          const poolInfoKey = (accounts[2] as anchor.web3.AccountMeta).pubkey;
          const poolInfo: any = await wrapper.account.poolInfo.fetch(poolInfoKey);
          const poolRemainingAccounts = Object.keys(poolInfo).map((key) => ({
              pubkey: poolInfo[key],
              isWritable: true,
              isSigner: false,
            }));
          remainingAccounts = poolRemainingAccounts.concat(accounts);

          await registry.simulate.execute(
            globalStateBump,
            registerRequestBump,
            new anchor.BN(requestId),
            {
              accounts: {
                executionAuthority: executor.publicKey,
                globalState: globalStateKey,
                register: register,
                registerRequest: registerRequestKey,
                transaction: registerRequest.transaction,
                fees,
                systemProgram,
              },
              remainingAccounts: remainingAccounts.concat({
                pubkey: event.data.programId,
                isWritable: false,
                isSigner: false,
              }),
              signers: [executor],
            }
          );

          console.log(`Simulation success for Request #${requestId.toString()} of ${register.toBase58()}`);

          await registry.rpc.execute(
            globalStateBump,
            registerRequestBump,
            new anchor.BN(requestId),
            {
              accounts: {
                executionAuthority: executor.publicKey,
                globalState: globalStateKey,
                register: register,
                registerRequest: registerRequestKey,
                transaction: registerRequest.transaction,
                fees,
                systemProgram,
              },
              remainingAccounts: remainingAccounts.concat({
                pubkey: event.data.programId,
                isWritable: false,
                isSigner: false,
              }),
              signers: [executor],
            }
          );
          allEvents.splice(i, 1);
          console.log(`Execution success for Request #${requestId.toString()} of ${register.toBase58()}`);
        }
      } catch(e) {
        console.log(`Request #${requestId.toString()} of ${register.toBase58()} Simulation failed`);
        // console.log(e);
      }
    }    
  }

  // registry.addEventListener("Register", async (data: any, slot: number) => {
  //   const event = {
  //     name: "Register",
  //     data,
  //   }
  //   // prevent double add
  //   if (isEventInArray(event)) {
  //     return;
  //   }
  //   if ((await isExecutedOrCancelled(event)) == false) {
  //     allEvents.push(event);
  //     console.log(`Request #${(event.data.requestId as anchor.BN).toString()} of ${(event.data.register as anchor.web3.PublicKey).toBase58()} is added`);
  //   }
  // })

  // 3. Iterate and simulate all events. If not reverted, run it.
  const checkRequests = async () => {
    console.log("Check all requests at", new Date().toLocaleString());
    const res = await scanAllReqeusts(lastSignature);
    if (!!res) {
      lastSignature = res;
    }
    console.log("There are", allEvents.length, "requests");
    await executeRequests();
    setTimeout(checkRequests, 10000);
  }

  checkRequests();
}

main();
