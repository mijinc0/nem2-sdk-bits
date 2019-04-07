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
import { filter } from 'rxjs/operators';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId( '4c05b1aaa8cacd34' );

// roles //

// private: 8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23
// public: B21996BB15E10C6B63E24F5B7DA3B4170A6C717B29EB7C5655543AC800296BE7
// address: SCPS7HCQJNNPNC62BHSHKO4LJFC7MQU5DKX2HBRX
const alice = nem.Account.createFromPrivateKey( '8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23' , netType );

// private: 45508839EE8040F9EF959A52F2D39A0F5BB6D4E18ABE05E2F884B0898F5EE249
// public: A2D57A50D350BEEA37C61F962A32556B4C2CA0F9705B05110AE5A608239D6311
// address: SCOEGQPG2R57JVI6XWLYMP7DQS37IJM7FW45NUCC
const bob   = nem.Account.createFromPrivateKey( '45508839EE8040F9EF959A52F2D39A0F5BB6D4E18ABE05E2F884B0898F5EE249' , netType );

// private: BBC5AF24DED78C101169F97316EE00D0F2C6FDF026AFA21F88267BECAC30F276
// public: 2C92F06EFA24626CF630691320D7D28B7502BD38108DCB60944B2D45D09A2887
// address: SB43TB7H2AGKWPMO4LLY4VV6I2UMKLISMFNUYTB7
const carol = nem.Account.createFromPrivateKey( 'BBC5AF24DED78C101169F97316EE00D0F2C6FDF026AFA21F88267BECAC30F276' , netType );

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
