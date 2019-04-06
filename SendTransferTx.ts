// Send transfer tx

import {
  Account, PublicAccount, Address, Deadline, UInt64, NetworkType,
  PlainMessage, TransferTransaction, Mosaic, MosaicId,
  TransactionHttp, MosaicNonce
} from 'nem2-sdk'

// create TransferTx //

const netType = NetworkType.MIJIN_TEST;

const txDeadline = Deadline.create();

const recipientAddr = Address.createFromRawAddress('SC3SWLT6JBIJ23ZHNKFQRCRGQUQ2JJHG7EVUPD45');

// calc modaic id
const xemMosaicId   = new MosaicId( '4c05b1aaa8cacd34' );

const mosaics       = [ new Mosaic( xemMosaicId , UInt64.fromUint(1000000000) ) ];

console.log( "mosaic ID : " + xemMosaicId.toHex() );

const msg = PlainMessage.create( 'good luck' );

const transferTx = TransferTransaction.create(
  txDeadline,
  recipientAddr,
  mosaics,
  msg,
  netType
);

// sign into tx //

const privKey   = '62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2';

const senderAcc = Account.createFromPrivateKey( privKey , netType );

const signedTx  = senderAcc.sign( transferTx );

// send tx //

const transactionEndpoint = new TransactionHttp( 'http://localhost:3000' );

transactionEndpoint.announce( signedTx ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
  () => console.log("complete")
);
