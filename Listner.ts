import{
  Account, PublicAccount, Address, Deadline, UInt64, NetworkType,
  PlainMessage, TransferTransaction, Mosaic, MosaicId,
  TransactionHttp, Listener, Transaction
} from 'nem2-sdk'

const url = 'http://localhost:3000';

// Observe confirmed tx at one address
const observedAddr = Address.createFromRawAddress( 'SD4MQDCJ6WC6GTGUP2PWFORXZSERFG2UHBU7ZHOQ' );


// sent xem to observedAddr //

// Just sending xem to observedAddr
function sendMosaicToObservedAddr(){
  const netType = NetworkType.MIJIN_TEST;
  const transferTx = TransferTransaction.create(
    Deadline.create(),
    observedAddr,
    [ new Mosaic( new MosaicId( '4c05b1aaa8cacd34' ), UInt64.fromUint(1000000000) ) ],
    PlainMessage.create( '' ),
    netType,
  );
  // private: 8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23
  // public: B21996BB15E10C6B63E24F5B7DA3B4170A6C717B29EB7C5655543AC800296BE7
  // address: SCPS7HCQJNNPNC62BHSHKO4LJFC7MQU5DKX2HBRX
  const privKey   = '8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23';
  const senderAcc = Account.createFromPrivateKey( privKey , netType );
  const signedTx  = senderAcc.sign( transferTx );
  const transactionEndpoint = new TransactionHttp( url );
  transactionEndpoint.announce( signedTx ).subscribe(
    x   => { console.log( x ); },
    err => { console.error( err ); },
    ()  => { console.log( 'Finish to send tx' ); },
  );
}

// Observe tx with Listener //

const listener = new Listener( url );

// First of all, you should open connection.
listener.open().then( () => {
  // and after open, you can set observers.
  listener.confirmed( observedAddr ).subscribe(
    tx => { console.log( 'Notice : tx confirmed. TX_HASH( %s )', tx.transactionInfo.hash ); },
    e  => { console.error( e ); },
  );
});
// Listener observe until listener is closed.

sendMosaicToObservedAddr( );
