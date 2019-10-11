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
import { TxUtil } from './share/TxUtil';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

// roles //

const alice = nem.Account.createFromPrivateKey('693BCC0958A527AED45EB107D8194CB01731F1B21B049A9A03C3A324A7DF141C', netType);

const bob = nem.Account.createFromPrivateKey('C11B69D9AAC313BBF319252B84B00875AA4A8FCFA136CC8B4ECB36A0D84194B1', netType);

const carol = nem.Account.createFromPrivateKey('B8BB5C3E43825E759EA6DD23021D418F268FE8E6B24DFFF3554A16BEC93ABC8D', netType);

const dave = nem.Account.createFromPrivateKey('EEDB38408CB76EC90B0680FB00DF40CEFBB7547A1DFE566726E2CD948E81862B', netType);

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
