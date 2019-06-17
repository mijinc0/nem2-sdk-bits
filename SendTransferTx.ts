// Send transfer tx
import * as nem from 'nem2-sdk'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const option = new DefaultOptParse().parse();
const senderPrivateKey = option.get('privateKey');
const recipientAddress = option.get('address');

// create TransferTx //
const netType = nem.NetworkType.MIJIN_TEST;
const txDeadline = nem.Deadline.create();
const recipient = nem.Address.createFromRawAddress('SCPOHZ3BM2WKW2YE4JR6QOYMYXXKKITAAUSSMPQE');

// calc modaic id
const xemMosaicId = new nem.MosaicId('6EEC7FB674DD1DDB');
const mosaics = [new nem.Mosaic(xemMosaicId, nem.UInt64.fromUint(300000000))];

console.log("mosaic ID : " + xemMosaicId.toHex());

const msg = nem.PlainMessage.create('good luck');

const transferTx = nem.TransferTransaction.create(
    txDeadline,
    recipient,
    mosaics,
    msg,
    netType
);

// send tx /

const url = 'http://localhost:3000';
const senderAccount = nem.Account.createFromPrivateKey(senderPrivateKey, netType);

TxUtil.sendSinglesigTx(senderAccount, transferTx, url);
