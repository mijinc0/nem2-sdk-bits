import * as nem from 'nem2-sdk';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId( '54a4fc96c8d1c8cb' );

const url = 'http://localhost:3000';

// private: F490BD5BCC51EC54F3A679D07A442F0B5D20DD309DDE399CA7EF92901B847926
// public: 91C905359D957918DA4BCF8A539D176F25998B008135017EA71AAAD30D76C91B
// address: SBD2PPSQ5R3RLAT6YPNNBYPPGU53JIEKAHNDMRWU
const issuer = nem.Account.createFromPrivateKey( 'F490BD5BCC51EC54F3A679D07A442F0B5D20DD309DDE399CA7EF92901B847926', netType );


// create properties //

const properties = nem.MosaicProperties.create({
  duration: nem.UInt64.fromUint( 1000 ),
  divisibility: 0,
  transferable: true,
  supplyMutable: false,
  levyMutable: false,
});


// create tx //

const txDeadline = nem.Deadline.create();

const mosaicNonce = nem.MosaicNonce.createRandom();
// If you want to decide nonce => nem.MosaicNonce.createFromHex( '00000000' );

const mosaicID = nem.MosaicId.createFromNonce( mosaicNonce, issuer.publicAccount );

const mosaicDefTx = nem.MosaicDefinitionTransaction.create(
  txDeadline,
  mosaicNonce,
  mosaicID,
  properties,
  netType,
);

const signedMosaicDefTx = issuer.sign( mosaicDefTx );


// prepare listener //

const listener = new nem.Listener( url );
const mosaicHttp = new nem.MosaicHttp( url );

function getTxInfos( tx: nem.Transaction ) :string {
  const txHash = tx.transactionInfo !== undefined ? tx.transactionInfo.hash : 'unknown';
  const height = tx.transactionInfo !== undefined ? tx.transactionInfo.height.lower : 'unknown';
  return `type:${tx.type}, hash:${txHash}, height:${height}`
}

function compareTx( tx: nem.Transaction, signedTx: nem.SignedTransaction ) :boolean {
  return tx.transactionInfo !== undefined && tx.transactionInfo.hash === signedTx.hash;
}

function printMosaicDefinedHeight( when: string ){
  mosaicHttp.getMosaic( mosaicID ).subscribe(
    info => { console.log( `Check mosic [${when}] ID:${mosaicID.toHex()} height:${info.height.toHex()}` ); },
    e => { console.log( `Check mosic [${when}] Undefined` ); },
  );
}

listener.open().then( () => {
  listener
    .confirmed( issuer.address )
    .subscribe(
      tx => {
        console.log( `Tx confirmed. ${getTxInfos(tx)}` );
        if( compareTx( tx, signedMosaicDefTx ) ){
          printMosaicDefinedHeight( 'after' );
          listener.close();
        }
      },
      e  => { console.error( e ); },
    );
});


// announce tx //

// print before state => expect undefined
printMosaicDefinedHeight( 'before' );

const txHttp = new nem.TransactionHttp( url );

txHttp.announce( signedMosaicDefTx ).subscribe(
  res => console.log( `Announce Tx. msg:${res.message}` ),
  err => console.error( err ),
);
