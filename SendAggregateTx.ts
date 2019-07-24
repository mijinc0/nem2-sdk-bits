// send AggregateTransaction

// You should turn off strictNullChecks when compile.
// [tsconfig.json]
// "strictNullChecks": false

/**

Step1. createInnerTxs( txAlice, txBob, txCarol )
Step2. Aggregate these txs with Aggregate(Bond)Tx
Step3. create & send LockFundsTx to send Aggregate(Bond)Tx
Step4. send Aggregate(Bond)Tx
Step5. create& send CosignatureTx

======================
=  Aggregate(Bond)Tx =
=                    =
= initiator : Alice  =
=                    =
= txs :              =
=   Alice to Dave    =
=   Bob   to Dave    =
=   Carol to Dave    =
======================

**/
import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst';
import {TxUtil} from './share/TxUtil';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

// roles //

const alice = nem.Account.createFromPrivateKey('8F5CB5C10267336C0B00579481907DBAC987FCAE279010277C093DB7256564C3', netType);

const bob = nem.Account.createFromPrivateKey('A7B5D37D71FE1F79BBC55D51E0D93980645874E33DD3A1F176E0702D648BEB87', netType);

const carol = nem.Account.createFromPrivateKey('EC4C964BFDB8A32CF6FB0A7A8DCD62E80722B2FD21319021B694EA4D88D37E55', netType);

const dave = nem.Account.createFromPrivateKey('375F7F10892E22A923451C9ED553177690D95ED029625A5851FDE8AD99E036FD', netType);

const cosigners = [alice, bob, carol];

function createInnerTx(senderAcc: nem.Account): nem.InnerTransaction {
    const tx = nem.TransferTransaction.create(
        nem.Deadline.create(),
        dave.address, // recipient
        [new nem.Mosaic(currencyMosaicId, nem.UInt64.fromUint(1000000000))], // send mosaics
        nem.PlainMessage.create('Happy birthday dave'),
        netType
    );
    return tx.toAggregate(senderAcc.publicAccount); // to inner tx
}


function createInnerTxs(): nem.InnerTransaction[] {
    // create inner txs of bob, carol, and alice(initiator)
    return cosigners.map(cosigner => { return createInnerTx(cosigner) });
}

const innerTxs = createInnerTxs();
const url = 'http://localhost:3000';

TxUtil.sendAggreagateBondedTx(
    cosigners[0],
    cosigners.slice(1),
    innerTxs,
    url
);
