import {Connection , clusterApiUrl, Keypair, PublicKey} from '@solana/web3.js'
import bs58 from 'bs58'
import {getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, transfer, Account} from '@solana/spl-token'

(async() => {
    const connection  = new Connection(clusterApiUrl('devnet')) 
    let pvkey = '59U3bepXtSf3UTH1C7wAzEgUhZ8KXyEa9k4CuKNjqpJjXQEJezUJ2Sr4YuCYJCcGqUSMdWhB5MrxkwVQ27B7qSAW'
    const keypair = Keypair.fromSecretKey(bs58.decode(pvkey))
    console.log(keypair)
    const myKeypair = Keypair.fromSecretKey(keypair.secretKey);


    const tokenMintAddress =  new PublicKey('EseT53AVrLesqDTzke3Ggf44qDz77Mw1Hzb1JhKyLVu3'); // address of nft
    const nftReciver =  new PublicKey('SE2bjXNLujbRJdK7dG4AncaFBHRPGwVTcCWJNAUMK7q');

    let my_token_account = await getOrCreateAssociatedTokenAccount(
        connection, 
        myKeypair, 
        tokenMintAddress, 
        myKeypair.publicKey, 
        false,
        'finalized', 
        {'skipPreflight': false },
        TOKEN_PROGRAM_ID, 
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

    let reciver_token_account = await getOrCreateAssociatedTokenAccount(
        connection, 
        myKeypair, 
        tokenMintAddress, 
        nftReciver, 
        false,
        'finalized',
        {'skipPreflight': false },
        TOKEN_PROGRAM_ID, 
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

    console.log('My token account public address: ' + my_token_account.address.toBase58());
    console.log('Reciver token account public address: ' + reciver_token_account.address.toBase58());

    try {
        await transfer_tokens(
         myKeypair, connection, 1, reciver_token_account, my_token_account,
          )
      } catch (error) {
        console.log(error)
      }
          
      console.log('Done!');


    // console.log("secretkey",Keypair.secretKey)
    // const myKeypair = web3.Keypair.fromSecretKey(Keypair.secretKey);

})();

async function transfer_tokens(wallet:Keypair, connection : Connection, amount:number, reciver_token_account: Account , from_token_account: Account) {
    //if trx takes more when 60 sec to complete you will receive error here
    const transfer_trx = await transfer(
      connection, 
      wallet, 
     from_token_account.address, 
      reciver_token_account.address, 
       wallet, 
      amount, 
      [wallet], 
    {'skipPreflight': false },

      TOKEN_PROGRAM_ID,
      )
  
    console.log(transfer_trx)
    
    console.log("Transcation signature", transfer_trx);
    console.log("Success!(we assume)");   
  
  }