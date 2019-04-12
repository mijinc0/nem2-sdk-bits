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
const xemMosaicId   = new MosaicId( '54a4fc96c8d1c8cb' );

const mosaics       = [ new Mosaic( xemMosaicId , UInt64.fromUint(100000000) ) ];

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

const privKey   = '7AE3E880903F6647C896B2C4B422C0D579805C8A2BD71A2B046822CF9E0A7D20';

const senderAcc = Account.createFromPrivateKey( privKey , netType );

const signedTx  = senderAcc.sign( transferTx );

// send tx //

const transactionEndpoint = new TransactionHttp( 'http://localhost:3000' );

transactionEndpoint.announce( signedTx ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
  () => console.log("complete")
);
