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
= initiater : Alice  =
=                    =
= txs :              =
=   Alice to Dave    =
=   Bob   to Dave    =
=   Carol to Dave    =
======================

**/
import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

// roles //

const alice = nem.Account.createFromPrivateKey('FA748AD5209A37C2C8AB8F9C701326220B0EAAFC17A88DF51C50383D8B4B9936', netType);

const bob = nem.Account.createFromPrivateKey('332D744B3E32CCEF36DF8975444DC1E5C63CBB0651F54A3AA39A7D196CEDD83C', netType);

const carol = nem.Account.createFromPrivateKey('6DC4E600521B5550D35172AE416737927101BAB285B7E9AFCE592B5B22DE1C97', netType);

const dave = nem.Account.createFromPrivateKey('68A8136E183EA14B13ECA830F3F87A3BABDE9AD6668E30EA05343A53EEA98070', netType);

const cosigners = [bob, carol];
const initiater = alice;


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
    // create inner txs of bob, carol, and alice(initiater)
    return cosigners.concat([initiater]).map(cosigner => { return createInnerTx(cosigner) });
}


function createSignedAggregateTx(): nem.SignedTransaction {
    const aggregateTx = nem.AggregateTransaction.createBonded(
        nem.Deadline.create(),
        createInnerTxs(),
        netType,
    );

    return initiater.sign(aggregateTx, NemConst.NEMESIS_GENERATION_HASH);
}


function createSignedLockFundsTx(signedAggregateTx: nem.SignedTransaction): nem.SignedTransaction {
    const lockedMosaic = new nem.Mosaic(currencyMosaicId, nem.UInt64.fromUint(10000000)); // 10,000,000 = 10xem

    // If the block height of this tx stored block is 100,
    // this transaction is invalidated at block height 150.(when duration = 50)
    const duration = nem.UInt64.fromUint(50);

    const lockFundsTx = nem.LockFundsTransaction.create(
        nem.Deadline.create(),
        lockedMosaic,
        duration,
        signedAggregateTx,
        netType,
    );

    return initiater.sign(lockFundsTx, NemConst.NEMESIS_GENERATION_HASH);
}


function announce(tx: nem.SignedTransaction, epURL: string) {

    const ep = new nem.TransactionHttp(epURL);

    ep.announce(tx).subscribe(
        res => console.log(`SignedTx [${tx.type}] announced. hash:${tx.hash} , msg:${res.message}`),
        err => console.log(err),
    );
}


function announceAggregateTx(tx: nem.SignedTransaction, epURL: string) {

    const ep = new nem.TransactionHttp(epURL);

    ep.announceAggregateBonded(tx).subscribe(
        res => console.log(`AggregateTx announced. hash:${tx.hash} , msg:${res.message}`),
        err => console.log(err),
    );
}


function announceCosigTx(tx: nem.CosignatureSignedTransaction, epURL: string) {

    const ep = new nem.TransactionHttp(epURL);

    ep.announceAggregateBondedCosignature(tx).subscribe(
        res => console.log(`CosigTx announced cosigner:${tx.signer} , msg:${res.message}`),
        err => console.log(err),
    );
}


function createAndAnnounceCosigTxs(announcedAggregateTx: nem.AggregateTransaction, epURL: string) {
    cosigners.forEach(cosigner => {
        // create Unsigned cosigTx
        const cosigTx = nem.CosignatureTransaction.create(announcedAggregateTx);
        // cosigners sign into Unsigned cosigTx
        const signedCosigTx = cosigner.signCosignatureTransaction(cosigTx);
        // send
        announceCosigTx(signedCosigTx, epURL);
    });
}


function getTxInfos(tx: nem.Transaction): string {
    const txHash = tx.transactionInfo !== undefined ? tx.transactionInfo.hash : 'unknown';
    const height = tx.transactionInfo !== undefined ? tx.transactionInfo.height.lower : 'unknown';
    return `type:${tx.type}, hash:${txHash}, height:${height}`
}


function compareTx(tx: nem.Transaction, signedTx: nem.SignedTransaction): boolean {
    return tx.transactionInfo !== undefined && tx.transactionInfo.hash === signedTx.hash;
}


// send txs step by step //

const url = 'http://localhost:3000';

const listener = new nem.Listener(url);

const signedAggregateTx = createSignedAggregateTx();

const signedLockFundsTx = createSignedLockFundsTx(signedAggregateTx);

listener.open().then(() => {

    // send LockFundsTx
    announce(signedLockFundsTx, url);

    listener
        .confirmed(initiater.address)
        .subscribe(
            tx => {
                console.log(`tx confirmed. ${getTxInfos(tx)}`);
                // LockFundsTx confirmed => send AggregateTx
                if (compareTx(tx, signedLockFundsTx)) announceAggregateTx(signedAggregateTx, url);
                // AggregateTx confirmed => finish (close listener)
                if (compareTx(tx, signedAggregateTx)) listener.close();
            },
            e => { console.error(e); },
            () => { console.log('AggregateTx confirmed. close listener...') },
    );

    // AggregateTx announced => send CosigTxs
    listener
        .aggregateBondedAdded(bob.address)
        .subscribe(
            tx => { if (compareTx(tx, signedAggregateTx)) createAndAnnounceCosigTxs(tx, url); },
            e => { console.error(e); },
    );

    listener.aggregateBondedRemoved(initiater.address).subscribe(
        txHash => { console.log(`AggregateTx removed. hash:${txHash}`); },
        e => { console.error(e); },
    );
});
