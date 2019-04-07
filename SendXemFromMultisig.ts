// It is recommended to try aggregateTransaction before trying multisigTransaction.

/*

[ address ]

 private: 62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2
 public: 3E2DD86CE1DD2800C22D0C02087C35570314B2ECFAB0DDC91AB65F98B98DFFD5
 address: SDPOMSYDWAJYPGZAXPLRUDFVJTDVEH26UDRGGNCW


[ Keys have permission of above address ]

 private: ADC9E162513CAF0E889E02BCE05A3F17EB99CEF5D80AC4B0C8DB04E861A66835
 public: C5184722F48D445B0CA3282BCD753117306FFA96FB6CBA69217A5F228665D91A
 address: SC3SWLT6JBIJ23ZHNKFQRCRGQUQ2JJHG7EVUPD45

 private: 8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23
 public: B21996BB15E10C6B63E24F5B7DA3B4170A6C717B29EB7C5655543AC800296BE7
 address: SCPS7HCQJNNPNC62BHSHKO4LJFC7MQU5DKX2HBRX

*/

import * as nem from 'nem2-sdk';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId( '54a4fc96c8d1c8cb' );

const url = 'http://localhost:3000';
const txHttp = new nem.TransactionHttp( url );

// roles //

const multisigAcc = nem.PublicAccount.createFromPublicKey( '3E2DD86CE1DD2800C22D0C02087C35570314B2ECFAB0DDC91AB65F98B98DFFD5', netType );

const initiater = nem.Account.createFromPrivateKey( 'ADC9E162513CAF0E889E02BCE05A3F17EB99CEF5D80AC4B0C8DB04E861A66835', netType );

const cosigner = nem.Account.createFromPrivateKey( '8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23', netType );


// functions //

function createInnerTxs() :nem.InnerTransaction[] {
  const transferTx = nem.TransferTransaction.create(
    nem.Deadline.create(),
    multisigAcc.address, // recipient
    [ new nem.Mosaic( currencyMosaicId , nem.UInt64.fromUint(10000000) ) ], // send mosaics
    nem.PlainMessage.create( 'success to send xem from multisig' ),
    netType
  );

  return [ transferTx.toAggregate( multisigAcc ) ];
}


function createSignedMultisigTx() :nem.SignedTransaction {

  // You can use aggregateTx whrn you want to send mosaics from multisig account.
  const aggregateTx = nem.AggregateTransaction.createBonded(
    nem.Deadline.create(),
    createInnerTxs(),
    netType,
  );

  return initiater.sign( aggregateTx );
}


function createSignedLockFundsTx( signedAggregateTx: nem.SignedTransaction ) :nem.SignedTransaction {
  const lockedMosaic = new nem.Mosaic( currencyMosaicId, nem.UInt64.fromUint(10000000) ); // 10,000,000 = 10xem
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


function announce( tx: nem.SignedTransaction ){
  txHttp.announce( tx ).subscribe(
    res => console.log( `SignedTx [${tx.type}] announced. hash:${tx.hash} , msg:${res.message}` ),
    err => console.log( err ),
  );
}


function announceMultisigTx( tx: nem.SignedTransaction ){
  txHttp.announceAggregateBonded( tx ).subscribe(
    res => console.log( `MultisigTx ( AggregateTx ) announced. hash:${tx.hash} , msg:${res.message}` ),
    err => console.log( err ),
  );
}


function announceCosigTx( tx: nem.CosignatureSignedTransaction ){
  txHttp.announceAggregateBondedCosignature( tx ).subscribe(
    res => console.log( `CosigTx announced cosigner:${tx.signer} , msg:${res.message}` ),
    err => console.log( err ),
  );
}


function createAndAnnounceCosigTx( announcedMultisigTx: nem.AggregateTransaction ){
  const cosigTx  = nem.CosignatureTransaction.create( announcedMultisigTx );
  const signedCosigTx = cosigner.signCosignatureTransaction( cosigTx );
  announceCosigTx( signedCosigTx );
}


function getTxInfos( tx: nem.Transaction ) :string {
  const txHash = tx.transactionInfo !== undefined ? tx.transactionInfo.hash : 'unknown';
  const height = tx.transactionInfo !== undefined ? tx.transactionInfo.height.lower : 'unknown';
  return `type:${tx.type}, hash:${txHash}, height:${height}`
}


function compareTx( tx: nem.Transaction, signedTx: nem.SignedTransaction ) :boolean {
  return tx.transactionInfo !== undefined && tx.transactionInfo.hash === signedTx.hash;
}


// announce txs //

const listener = new nem.Listener( url );

const signedMultisigTx = createSignedMultisigTx();

const signedLockFundsTx = createSignedLockFundsTx( signedMultisigTx );

listener.open().then( () => {

  // send LockFundsTx
  announce( signedLockFundsTx );

  listener
    .confirmed( initiater.address )
    .subscribe(
      tx => {
        console.log( `tx confirmed. ${getTxInfos(tx)}` );
        // LockFundsTx confirmed => send AggregateTx
        if( compareTx( tx, signedLockFundsTx ) ) announceMultisigTx( signedMultisigTx );
        // MultisigTx confirmed => finish (close listener)
        if( compareTx( tx, signedMultisigTx ) ) listener.close();
      },
      e  => { console.error( e ); },
      () => { console.log( 'AggregateTx confirmed. close listener...' ) },
    );

  // MultisigTx announced => send CosigTxs
  listener
    .aggregateBondedAdded( cosigner.address )
    .subscribe(
      tx => { if( compareTx( tx, signedMultisigTx ) ) createAndAnnounceCosigTx( tx ); },
      e  => { console.error( e ); },
    );

  listener.aggregateBondedRemoved( initiater.address ).subscribe(
    txHash => { console.log( `MultisigTx removed. hash:${txHash}` ); },
    e      => { console.error( e ); },
  );
});
