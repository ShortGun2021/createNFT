
import { WalletAdapterNetwork,WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import ReactDOM from 'react-dom';
import bs58 from 'bs58'
import {getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, transfer, Account} from '@solana/spl-token'

import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useCallback } from 'react';

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

let tokensInWallet:any = []

const GetNft : FC = () => {
    const connection = new Connection("https://api.devnet.solana.com");

    
    //getTokenAccountsByOwner(publicKey,)
    async function getTheTokensOfOwner(MY_WALLET_ADDRESS: string){
    

    
    (async () => {
      //const MY_WALLET_ADDRESS = "9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9";
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
      const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
          filters: [
            {
              dataSize: 165, // number of bytes
            },
            {
              memcmp: {
                offset: 32, // number of bytes
                bytes: MY_WALLET_ADDRESS, // base58 encoded string
              },
            },
          ],
        }
      );
    
      console.log(
        `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
      );
      let totalNFTsI = 0;
       await accounts.forEach((account, i) => {
         // account.account.data;
         let amountI = account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
         let mint_s = account.account.data["parsed"]["info"]["mint"]
    
        if (amountI==1){
          totalNFTsI += 1;

          try{
            console.log(
              `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
            );
            console.log(`Mint: ${mint_s}`);
            let objT:any = {};
            objT.mint = mint_s
            objT.amount =amountI
            tokensInWallet.push(objT)
            
           // let token_amount_i = account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]
            console.log(
              `Amount: ${amountI}`
              
            ); 
          }catch{
            //tokensInWallet.push({mint:mint_s,amount: amountI })
          }
    
        }
      
      });

      console.log("total NFTs: {}", totalNFTsI);

      let nfts_total_element = <span>({totalNFTsI})</span>;
 
      ReactDOM.render(nfts_total_element, document.getElementById("totalNFTs"))
 

      console.log("tokens: "+tokensInWallet)
      let currentI = 0
      await tokensInWallet.forEach(element => {
        console.log("element[currentI].mint"+element.mint)
        getAccountMetaData(element.mint, element.amount, currentI)  
        currentI+=1
      });
      //console.log("nfts: "+nftsInWallet)
     
      /*
        // Output
        Found 1 token account(s) for wallet FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T: 
        -- Token Account Address 1: Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb --
        Mint: BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf
        Amount: 3
      */
    })();
    }
    let elements:any = []
    
    async function UpdateTheUI(tokenInWallet, number){
    
      return fetch(tokenInWallet.uri)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.image)
         let element = <img src={responseJson.image} width="30%"/>;


         let elementname = <h1>{tokenInWallet.name}</h1>
          let button =  <> <br></br><button onClick= {onSend}>SEND</button> </>
          console.log(number, "tit"+number.toString())
    
        ReactDOM.render([element, button], document.getElementById("img"+number.toString()))
        

        ReactDOM.render(elementname, document.getElementById("tit"+number.toString()))

    
        console.log("theJson.image"+ responseJson.image)
        elements.push(element)
    
    
    
    
        return responseJson.image;
      })
      .catch((error) => {
        console.error(error);
      });
    
    
         
    }
    const onSend = () =>{
      (async() => {
        const connection  = new Connection(clusterApiUrl('devnet')) 
        let pvkey = 'privkey'
        const keypair = Keypair.fromSecretKey(bs58.decode(pvkey))
        console.log(keypair)
        const myKeypair = Keypair.fromSecretKey(keypair.secretKey);
    
    
        const tokenMintAddress =  new PublicKey('token address of nft'); // address of nft
        const nftReciver =  new PublicKey('senders wallet address');
    
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

      console.log("button click")

    }
    
    async function getAccountMetaData(mintAddress, amountI, numberI){
       (async () => {
        let mintPubkey = new PublicKey(mintAddress);
        let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);
      
        const tokenmeta:any = await Metadata.load(connection, tokenmetaPubkey);
        //console.log(tokenmeta);
       // console.log(tokenmeta.data.data["name"])
       // nftsInWallet.push({name: tokenmeta.data.data["name"], uri: tokenmeta.data.data["uri"]})
        //console.log("nfts: "+nftsInWallet)
       tokensInWallet[numberI].name = tokenmeta.data.data["name"]
       tokensInWallet[numberI].uri = tokenmeta.data.data["uri"]
      //  console.log("uri"+tokenmeta.data.data["uri"])
       console.log("data here ", tokenmeta.data.data["uri"])

      // const n =  tokenmeta.data.data["uri"]


       // console.log(tokenmeta.data.data["uri"])
       //tokensInWallet.push({mint:mintAddress })
       await UpdateTheUI(tokensInWallet[numberI], numberI)
    
       // UpdateTheUI(mintAddress, tokenmeta.data.data["uri"], tokenmeta.data.data["name"], numberI)
      })();
    }
    
    const { publicKey, sendTransaction } = useWallet();

    
    const onClick = useCallback( async () => {

      if (!publicKey) throw new WalletNotConnectedError();
      connection.getBalance(publicKey).then((bal) => {
          console.log(bal/LAMPORTS_PER_SOL);

      });

      console.log(publicKey.toBase58());
      getTheTokensOfOwner(publicKey.toBase58());

  }, [publicKey, sendTransaction, connection]);



  return (
    <>
    
    <div>GetNft</div>
    <div className='container-fluid' id='nfts'>
     
    <button onClick={onClick}>get NFTs</button>
  <br></br>  <h1>NFTs in wallet <span id='totalNFTs'></span></h1>

  
  
  <div className='row-fluid'>

    <div className='span1'>
  <ul className="thumbnails">
<p id="tit0"></p>

<li className="span2">
 <div id='img0'  className="thumbnail0">
 </div>
</li>

</ul>
    </div>


    <div className='span4'>

<ul className="thumbnails">
<p id="tit1"></p>

<li className="span10">
 <div id='img1'  className="thumbnail0">
 </div>
</li>

</ul>
</div>

<div className='span4'>
<ul className="thumbnails">
<p id="tit2"></p>

<li className="span10">
 <div id='img2'  className="thumbnail0">
 </div>
</li>

</ul>
</div>
  </div>




  <div className='row-fluid'>

<div className='span4'>
<ul className="thumbnails">
<p id="tit3"></p>

<li className="span10">
<div id='img3'  className="thumbnail0">
</div>
</li>

</ul>
</div>


<div className='span4'>

<ul className="thumbnails">
<p id="tit4"></p>

<li className="span10">
<div id='img4'  className="thumbnail0">
</div>
</li>

</ul>
</div>

<div className='span4'>

<ul className="thumbnails">
<p id="tit5"></p>

<li className="span10">
<div id='img5'  className="thumbnail0">
</div>
</li>

</ul>
</div>
</div>



<div className='row-fluid'>

<div className='span4'>
<ul className="thumbnails">
<p id="tit6"></p>

<li className="span10">
<div id='img6'  className="thumbnail0">
</div>
</li>

</ul>
</div>


<div className='span4'>

<ul className="thumbnails">
<p id="tit7"></p>

<li className="span10">
<div id='img7'  className="thumbnail0">
</div>
</li>

</ul>
</div>

<div className='span4'>

<ul className="thumbnails">
<p id="tit8"></p>

<li className="span10">
<div id='img8'  className="thumbnail0">
</div>
</li>

</ul>
</div>
</div>




</div>
</>

  )
}

export default GetNft