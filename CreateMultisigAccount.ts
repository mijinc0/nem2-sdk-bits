// change nomal account into multisig account
// You should send ModifyMultisigAccountTransaction to change.

import{
  NetworkType, TransactionHttp, ModifyMultisigAccountTransaction,
  Deadline, UInt64, MultisigCosignatoryModification, PublicAccount,
  TransactionInfo, Account, MultisigCosignatoryModificationType,
} from 'nem2-sdk'

// create ModifyMultisigAccountTransaction //

function createModifications( publicKeys: string[] , modType: string , netType: NetworkType ) :MultisigCosignatoryModification[] {
  return publicKeys.map( ( pk )=>{
    return new MultisigCosignatoryModification(
      MultisigCosignatoryModificationType[ modType ],
      PublicAccount.createFromPublicKey( pk , netType ),
    );
  });
}

const netType = NetworkType.MIJIN_TEST;

const version = 3;

const txDeadline = Deadline.create();

const minApprovalDelta = 1;

const minRemovalDelta = 1;

const cosignatoryPublicKeys = [
  'ADC9E162513CAF0E889E02BCE05A3F17EB99CEF5D80AC4B0C8DB04E861A66835',
  '0B78AB270FB311C52B0C3F02F713E8A7D5285462BB393710B2F64E1AF7FECC34',
];

const modifications = createModifications( cosignatoryPublicKeys , 'Add' , netType );

const modMulsigAccTx = ModifyMultisigAccountTransaction.create(
  txDeadline,
  minApprovalDelta,
  minRemovalDelta,
  modifications,
  netType,
);

// sign into tx //

const privateKey = '62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2';

const signer = Account.createFromPrivateKey( privateKey , netType );

const signedTx = signer.sign( modMulsigAccTx );

// send tx //

const transactionEndpoint = new TransactionHttp( 'http://localhost:3000' );

transactionEndpoint.announce( signedTx ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
);
