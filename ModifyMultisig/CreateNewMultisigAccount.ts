import * as nem from 'nem2-sdk'
import { TxUtil } from './TxUtil'

/**
           private key: 4E6124BE269BFDB03D929C1D6D00660DE62729C8B018A3563F19A9C5581C40E9
            public key: 671573627CD26DB22422F1E0606B910C3A26A8FCBCAB56FA2DDD5EDA2E322731
  address (mijin-test): SA3BPBE7MHKSV6XPP75D2UNODZNE7UVJZQH57C4E

           private key: F2E5272922F4884ED2EE2C5B6E430BA2A3A31D70174F931CC45BC6DD66D5BA5D
            public key: F56D2E02212C147EA5BA755362554532E8FF48FD63B7EB8A1756BC81AA315144
  address (mijin-test): SAHDH2Z3CWLYC2BHUDWSO3DZUMUXU4VWJFAHGQPX

           private key: C958C86A232F0D512B30E1EFE57EF0CDFE34E628D6781838967C7FA6D922F34A
            public key: 7D59A9B7B89914B5631A6FABF82DE215F726A2170F5D6089AB1E0B06E5D8FE4C
  address (mijin-test): SCPOHZ3BM2WKW2YE4JR6QOYMYXXKKITAAUSSMPQE

**/

const url = 'http://localhost:3000';
const netType = nem.NetworkType.MIJIN_TEST;
const multisigAccount = nem.Account.createFromPrivateKey('4E6124BE269BFDB03D929C1D6D00660DE62729C8B018A3563F19A9C5581C40E9',netType);
const cosignersPublicKeys = [
	'F56D2E02212C147EA5BA755362554532E8FF48FD63B7EB8A1756BC81AA315144',
	'7D59A9B7B89914B5631A6FABF82DE215F726A2170F5D6089AB1E0B06E5D8FE4C',
];
const minApprovalDelta = cosignersPublicKeys.length;
const minRemovalDelta  = cosignersPublicKeys.length;

const modifications = cosignersPublicKeys.map( pk =>{
	return new nem.MultisigCosignatoryModification(
		nem.MultisigCosignatoryModificationType.Add,
		nem.PublicAccount.createFromPublicKey(pk, netType)
	);
});

const newMultisigAccountTx = nem.ModifyMultisigAccountTransaction.create(
	nem.Deadline.create(),
	minApprovalDelta,
	minRemovalDelta,
	modifications,
	netType
);


TxUtil.sendSinglesigTx(multisigAccount, newMultisigAccountTx, url);
