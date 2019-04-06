import{
  LockFundsTransaction, TransactionHttp, Account, NetworkType, UInt64, MosaicId,
  Mosaic, Deadline, SignedTransaction, TransferTransaction, Address, PlainMessage
} from 'nem2-sdk'

// create LockFunds //

function createLockedMosaic( mosaicIdHex :string , amountNum: number ) :Mosaic {
  const mosaicId = new MosaicId( mosaicIdHex );
  const amount   = UInt64.fromUint( amountNum );
  return new Mosaic( mosaicId , amount );
}

function createNoticeTx(){
  const netType = NetworkType.MIJIN_TEST;
  const txDeadline = Deadline.create();
  const recipientAddr = Address.createFromRawAddress('SC3SWLT6JBIJ23ZHNKFQRCRGQUQ2JJHG7EVUPD45');
  const xemMosaicId   = new MosaicId( '4c05b1aaa8cacd34' );
  const mosaics       = [ new Mosaic( xemMosaicId , UInt64.fromUint(1000000000) ) ];
  const msg = PlainMessage.create( 'good luck' );
  const transferTx = TransferTransaction.create(
    txDeadline,
    recipientAddr,
    mosaics,
    msg,
    netType
  );
  const privKey   = '62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2';
  const senderAcc = Account.createFromPrivateKey( privKey , netType );

  return senderAcc.sign( transferTx );
}

const netType = NetworkType.MIJIN_TEST;

const currencyMosaicId = '4c05b1aaa8cacd34';
const lockedMosaic = createLockedMosaic( currencyMosaicId , 10000000 ); // 10,000,000 = 10xem

const txDeadline = Deadline.create();

// specify by block height
const duration = UInt64.fromUint( 100 );

// LockedMosaic is locked until this transaction is confirmed.
// create bad example, so far
const noticeTx = createNoticeTx();

const lockFundsTx = LockFundsTransaction.create(
  txDeadline,
  lockedMosaic,
  duration,
  noticeTx,
  netType,
);

// sign tx //

const privKey   = '62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2';

const senderAcc = Account.createFromPrivateKey( privKey , netType );

const signedTx  = senderAcc.sign( lockFundsTx );

// send tx //

const transactionEndpoint = new TransactionHttp( 'http://localhost:3000' );
// => Error : Signed transaction must be Aggregate Bonded Transaction

/**
transactionEndpoint.announce( signedTx ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
);
**/
