import * as nem from 'nem2-sdk'
import { TxUtil } from '../share/TxUtil'

const url = 'http://localhost:3000';
const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId('54a4fc96c8d1c8cb');
const multisigAccount = nem.Account.createFromPrivateKey('4E6124BE269BFDB03D929C1D6D00660DE62729C8B018A3563F19A9C5581C40E9',netType);
const cosignersPrivateKeys = [
	'F2E5272922F4884ED2EE2C5B6E430BA2A3A31D70174F931CC45BC6DD66D5BA5D',
	'C958C86A232F0D512B30E1EFE57EF0CDFE34E628D6781838967C7FA6D922F34A',
];
const cosigners = cosignersPrivateKeys.map( pk => { return nem.Account.createFromPrivateKey(pk,netType) });
const minApprovalDelta = -1;
const minRemovalDelta  = -1;

const modification = new nem.MultisigCosignatoryModification(
	nem.MultisigCosignatoryModificationType.Remove,
	cosigners[0].publicAccount
);

const modifyMultisigAccountTx = nem.ModifyMultisigAccountTransaction.create(
	nem.Deadline.create(),
	minApprovalDelta,
	minRemovalDelta,
	[modification],
	netType
);

const innerTxs = [ modifyMultisigAccountTx.toAggregate( multisigAccount.publicAccount ) ];

TxUtil.sendMultisigTx(
	cosigners,
	currencyMosaicId,
	innerTxs,
	url
);
