import * as nem from 'nem2-sdk';

// general info //

const netType = nem.NetworkType.MIJIN_TEST;

// create tx //

const version = 2;
const txDeadline    = nem.Deadline.create();
const maxFee        = nem.UInt64.fromUint( 40000000 ); // TODO: must be change
const namespaceType = nem.NamespaceType.RootNamespace;
const namespaceName = 'test1';
const namespaceId   = new nem.NamespaceId( namespaceName );
const duration      = nem.UInt64.fromUint( 30 );

const RNTx = new nem.RegisterNamespaceTransaction(
  netType,
  version,
  txDeadline,
  maxFee,
  namespaceType,
  namespaceName,
  namespaceId,
  duration,
);

// sign into tx //

const privKey   = '7AE3E880903F6647C896B2C4B422C0D579805C8A2BD71A2B046822CF9E0A7D20';
const senderAcc = nem.Account.createFromPrivateKey( privKey , netType );
const signedTx  = senderAcc.sign( RNTx );

// publish tx //

const url = 'http://localhost:3000';

const transactionEndpoint = new nem.TransactionHttp( url );

transactionEndpoint.announce( signedTx ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
  () => console.log("complete")
);
