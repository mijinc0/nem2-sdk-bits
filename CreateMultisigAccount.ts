// change nomal account into multisig account
// You should send ModifyMultisigAccountTransaction to change.

import{
  NetworkType, TransactionHttp, ModifyMultisigAccountTransaction,
  Deadline, UInt64, MultisigCosignatoryModification, PublicAccount,
  TransactionInfo, Account, MultisigCosignatoryModificationType,
} from 'nem2-sdk'

// create ModifyMultisigAccountTransaction //

function createModifications( publicKeys: string[] , modType: MultisigCosignatoryModificationType , netType: NetworkType ) :MultisigCosignatoryModification[] {

  return publicKeys.map( ( pk )=>{
    return new MultisigCosignatoryModification(
      modType,
      PublicAccount.createFromPublicKey( pk , netType ),
    );
  });
}

const netType = NetworkType.MIJIN_TEST;

const version = 3;

const txDeadline = Deadline.create();

const minApprovalDelta = 1;

const minRemovalDelta = 1;

// private: ADC9E162513CAF0E889E02BCE05A3F17EB99CEF5D80AC4B0C8DB04E861A66835
// public: C5184722F48D445B0CA3282BCD753117306FFA96FB6CBA69217A5F228665D91A
// address: SC3SWLT6JBIJ23ZHNKFQRCRGQUQ2JJHG7EVUPD45

// private: 8DFBA3B10FEAC9E637851303BCB7FADA2C422EECFBDD9339406419E023899F23
// public: B21996BB15E10C6B63E24F5B7DA3B4170A6C717B29EB7C5655543AC800296BE7
// address: SCPS7HCQJNNPNC62BHSHKO4LJFC7MQU5DKX2HBRX
const cosignatoryPublicKeys = [
  'C5184722F48D445B0CA3282BCD753117306FFA96FB6CBA69217A5F228665D91A',
  'B21996BB15E10C6B63E24F5B7DA3B4170A6C717B29EB7C5655543AC800296BE7',
];

const modifications = createModifications( cosignatoryPublicKeys , MultisigCosignatoryModificationType.Add , netType );

const modMulsigAccTx = ModifyMultisigAccountTransaction.create(
  txDeadline,
  minApprovalDelta,
  minRemovalDelta,
  modifications,
  netType,
);

// sign into tx //

// private: 62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2
// public: 3E2DD86CE1DD2800C22D0C02087C35570314B2ECFAB0DDC91AB65F98B98DFFD5
// address: SDPOMSYDWAJYPGZAXPLRUDFVJTDVEH26UDRGGNCW
const privateKey = '62340B188B1E9B7D308E8C10954A835DC6414086B575A74117F6C9346DB1FEA2';

const signer = Account.createFromPrivateKey( privateKey , netType );

const signedTx = signer.sign( modMulsigAccTx );

console.log(`Tx hash : ${signedTx.hash}`);

// send tx //

const transactionEndpoint = new TransactionHttp( 'http://localhost:3000' );

transactionEndpoint.announce( signedTx ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
);
