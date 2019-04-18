// send AggregateTransaction

// You should turn off strictNullChecks when compile.
// [tsconfig.json]
// "strictNullChecks": false

/**

Step1. createInnerTxs( txAlice, txBob, txCarol )
Step2. Aggregate these txs with Aggregate(Bond)Tx
Step3. create & send LockFundsTx to send Aggregate(Bond)Tx
Step4. send Aggregate(Bond)Tx
Step5. create& send CosignatureTx

======================
=  Aggregate(Bond)Tx =
=                    =
= initiater : Alice  =
=                    =
= txs :              =
=   Alice to Dave    =
=   Bob   to Dave    =
=   Carol to Dave    =
======================

**/
import * as nem from 'nem2-sdk';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId( '54a4fc96c8d1c8cb' );

// roles //

const alice = nem.Account.createFromPrivateKey( '7AE3E880903F6647C896B2C4B422C0D579805C8A2BD71A2B046822CF9E0A7D20' , netType );

const bob   = nem.Account.createFromPrivateKey( 'FEAC624E51F428A4409DA1709D028EA6A635AEBE457BC52E01120FE978581183' , netType );

const carol = nem.Account.createFromPrivateKey( 'F24B1D7917EB2612453DC345C32E483B051C614CE2AFF4DAA57CA6392C831028' , netType );

// private: DC8B34DAAC863920B14FE80757E301CFD39FD147ABDB9BC9650C504A1B00127C
// public: 8BA709C4621CA362321F640EDA2801E34ED5788A3A352B3D133069591F8AF087
// address: SD4MQDCJ6WC6GTGUP2PWFORXZSERFG2UHBU7ZHOQ
const dave = nem.Account.createFromPrivateKey( 'DC8B34DAAC863920B14FE80757E301CFD39FD147ABDB9BC9650C504A1B00127C' , netType );

const cosigners = [ bob, carol ];
const initiater = alice;


function createInnerTx( senderAcc: nem.Account ) :nem.InnerTransaction {
  const tx  = nem.TransferTransaction.create(
    nem.Deadline.create(),
    dave.address, // recipient
    [ new nem.Mosaic( currencyMosaicId , nem.UInt64.fromUint(1000000000) ) ], // send mosaics
    nem.PlainMessage.create( 'Happy birthday dave' ),
    netType
  );
  return tx.toAggregate( senderAcc.publicAccount ); // to inner tx
}


function createInnerTxs() :nem.InnerTransaction[] {
  // create inner txs of bob, carol, and alice(initiater)
  return cosigners.concat( [initiater] ).map( cosigner => { return createInnerTx( cosigner ) } );
}


function createSignedAggregateTx() :nem.SignedTransaction {
  const aggregateTx = nem.AggregateTransaction.createBonded(
    nem.Deadline.create(),
    createInnerTxs(),
    netType,
  );

  return initiater.sign( aggregateTx );
}


function createSignedLockFundsTx( signedAggregateTx: nem.SignedTransaction ) :nem.SignedTransaction {
  const lockedMosaic = new nem.Mosaic( currencyMosaicId, nem.UInt64.fromUint(10000000) ); // 10,000,000 = 10xem

  // If the block height of this tx stored block is 100,
  // this transaction is invalidated at block height 150.(when duration = 50)
  const duration = nem.UInt64.fromUint( 50 );

  const lockFundsTx = nem.LockFundsTransaction.create(
    nem.Deadline.create(),
    lockedMosaic,
    duration,
    signedAggregateTx,
    netType,
  );

  return initiater.sign( lockFundsTx );
}


function announce( tx: nem.SignedTransaction, epURL: string ){

  const ep = new nem.TransactionHttp( epURL );

  ep.announce( tx ).subscribe(
    res => console.log( `SignedTx [${tx.type}] announced. hash:${tx.hash} , msg:${res.message}` ),
    err => console.log( err ),
  );
}


function announceAggregateTx( tx: nem.SignedTransaction, epURL: string ){

  const ep = new nem.TransactionHttp( epURL );

  ep.announceAggregateBonded( tx ).subscribe(
    res => console.log( `AggregateTx announced. hash:${tx.hash} , msg:${res.message}` ),
    err => console.log( err ),
  );
}


function announceCosigTx( tx: nem.CosignatureSignedTransaction, epURL: string ){

  const ep = new nem.TransactionHttp( epURL );

  ep.announceAggregateBondedCosignature( tx ).subscribe(
    res => console.log( `CosigTx announced cosigner:${tx.signer} , msg:${res.message}` ),
    err => console.log( err ),
  );
}


function createAndAnnounceCosigTxs( announcedAggregateTx: nem.AggregateTransaction, epURL: string ){
  cosigners.forEach( cosigner => {
    // create Unsigned cosigTx
    const cosigTx  = nem.CosignatureTransaction.create( announcedAggregateTx );
    // cosigners sign into Unsigned cosigTx
    const signedCosigTx = cosigner.signCosignatureTransaction( cosigTx );
    // send
    announceCosigTx( signedCosigTx, epURL );
  });
}


function getTxInfos( tx: nem.Transaction ) :string {
  const txHash = tx.transactionInfo !== undefined ? tx.transactionInfo.hash : 'unknown';
  const height = tx.transactionInfo !== undefined ? tx.transactionInfo.height.lower : 'unknown';
  return `type:${tx.type}, hash:${txHash}, height:${height}`
}


function compareTx( tx: nem.Transaction, signedTx: nem.SignedTransaction ) :boolean {
  return tx.transactionInfo !== undefined && tx.transactionInfo.hash === signedTx.hash;
}


// send txs step by step //

const url = 'http://localhost:3000';

const listener = new nem.Listener( url );

const signedAggregateTx = createSignedAggregateTx();

const signedLockFundsTx = createSignedLockFundsTx( signedAggregateTx );

listener.open().then( () => {

  // send LockFundsTx
  announce( signedLockFundsTx, url );

  listener
    .confirmed( initiater.address )
    .subscribe(
      tx => {
        console.log( `tx confirmed. ${getTxInfos(tx)}` );
        // LockFundsTx confirmed => send AggregateTx
        if( compareTx( tx, signedLockFundsTx ) ) announceAggregateTx( signedAggregateTx, url );
        // AggregateTx confirmed => finish (close listener)
        if( compareTx( tx, signedAggregateTx ) ) listener.close();
      },
      e  => { console.error( e ); },
      () => { console.log( 'AggregateTx confirmed. close listener...' ) },
    );

  // AggregateTx announced => send CosigTxs
  listener
    .aggregateBondedAdded( bob.address )
    .subscribe(
      tx => { if( compareTx( tx, signedAggregateTx ) ) createAndAnnounceCosigTxs( tx, url ); },
      e  => { console.error( e ); },
    );

  listener.aggregateBondedRemoved( initiater.address ).subscribe(
    txHash => { console.log( `AggregateTx removed. hash:${txHash}` ); },
    e      => { console.error( e ); },
  );
});
