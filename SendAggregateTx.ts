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

const alice = nem.Account.createFromPrivateKey('E31B9DF8BB3FF23E7565B0D196AE8729833072881565EBCDF09C21684A4F8BCC', netType);

const bob = nem.Account.createFromPrivateKey('697B70115BBF61AFB8B034C5BCC692F4C39A96356137EF982A03EF455476760D', netType);

const carol = nem.Account.createFromPrivateKey('C9FF510FB052514285690B74BA711B0111B464CB1AFD6909CA98A8BC660F77A4', netType);

const dave = nem.Account.createFromPrivateKey('02C7F3A845CEE528AD0161F6D888CDA47275032559BD9B248AE8DCED8335ACB9', netType);

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
