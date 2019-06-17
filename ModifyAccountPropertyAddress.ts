import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

const url = 'http://localhost:3000';

const option = new DefaultOptParse().parse();
const privateKey = option.get('privateKey');
const address = option.get('address');

[privateKey, address].forEach(arg => {
    if (Util.isUndefined(arg)) console.error('argument parse fault.');
});

const modifiedAccount = nem.Account.createFromPrivateKey(privateKey, netType);
const targetAddress = nem.Address.createFromRawAddress(address);

// propertyType  : base of account property type. Allow or Block(Deny)
// modifications : modifications in "propertyType"
const propertyType = nem.PropertyType.BlockAddress;
const modifications = [
    nem.AccountPropertyModification.createForAddress(nem.PropertyModificationType.Add, targetAddress)
];

const modifyAccountPropertyAddressTx = nem.AccountPropertyTransaction.createAddressPropertyModificationTransaction(
    nem.Deadline.create(),
    propertyType,
    modifications,
    netType
);

TxUtil.sendSinglesigTx(modifiedAccount, modifyAccountPropertyAddressTx, url);
