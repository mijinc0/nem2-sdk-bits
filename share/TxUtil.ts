import * as nem from 'nem2-sdk'
import { NemConst } from './NemConst'

export namespace TxUtil {

    export function sendSinglesigTx(sender: nem.Account, tx: nem.Transaction, url: string): void {
        const signedTx = sender.sign(tx, NemConst.NEMESIS_GENERATION_HASH);
        announce(signedTx, url);
    }

    export function sendMultisigTx(
        initiater: nem.Account,
        cosignatories: nem.Account[],
        innerTxs: nem.InnerTransaction[],
        url: string
    ): void {
        if (cosignatories.length === 0 || innerTxs.length === 0) throw new Error("cosignatories or innerTxs or both is empty.");

        const signedMultisigTx = createSignedMultisigTx(initiater, innerTxs);
        const signedLockFundsTx = createSignedLockFundsTx(initiater, signedMultisigTx);

        const listener = new nem.Listener(url);
        listener.open().then(() => {

            listener.confirmed(initiater.address).subscribe(
                tx => {
                    console.log(`tx confirmed. ${getTxInfos(tx)}`);
                    // LockFundsTx confirmed => send AggregateTx
                    if (compareTx(tx, signedLockFundsTx)) announceMultisigTx(signedMultisigTx, url);
                    // MultisigTx confirmed => finish (close listener)
                    if (compareTx(tx, signedMultisigTx)) listener.close();
                },
                err => { console.error(`Error\n${err}`) }
            );

            listener.aggregateBondedAdded(initiater.address).subscribe(
                tx => { if (compareTx(tx, signedMultisigTx)) for (let k = 0; k < cosignatories.length; k++) { createAndAnnounceCosigTx(cosignatories[k], tx, url) }; },
                err => { console.error(err); },
            );

            // observe removing mulsitigTx from UTCache
            listener.aggregateBondedRemoved(initiater.address).subscribe(
                txHash => { console.log(`MultisigTx removed. hash:${txHash}`); },
                err => { console.error(`Error\n${err}`); },
            );

            // announce and start steps
            announce(signedLockFundsTx, url);
        });
    }

    function announce(tx: nem.SignedTransaction, url: string): void {
        const txHttp = new nem.TransactionHttp(url);
        txHttp.announce(tx).subscribe(
            res => console.log(`SignedTx [${tx.type}] announced. hash:${tx.hash} , msg:${res.message}`),
            err => console.log(err),
        );
    }

    function getTxInfos(tx: nem.Transaction): string {
        const txHash = tx.transactionInfo !== undefined ? tx.transactionInfo.hash : 'unknown';
        const height = tx.transactionInfo !== undefined ? tx.transactionInfo.height.lower : 'unknown';
        return `type:${tx.type}, hash:${txHash}, height:${height}`
    }

    function createSignedMultisigTx(initiater: nem.Account, innerTxs: nem.InnerTransaction[]): nem.SignedTransaction {
        const netType = innerTxs[0].networkType;
        const aggregateTx = nem.AggregateTransaction.createBonded(
            nem.Deadline.create(),
            innerTxs,
            netType
        );
        return initiater.sign(aggregateTx, NemConst.NEMESIS_GENERATION_HASH);
    }

    function createSignedLockFundsTx(initiater: nem.Account, signedMultisigTx: nem.SignedTransaction): nem.SignedTransaction {
        const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);
        const lockedMosaic = new nem.Mosaic(currencyMosaicId, nem.UInt64.fromUint(10000000));
        const duration = nem.UInt64.fromUint(50);
        const netType = signedMultisigTx.networkType;
        const lockFundsTx = nem.LockFundsTransaction.create(
            nem.Deadline.create(),
            lockedMosaic,
            duration,
            signedMultisigTx,
            netType
        );
        return initiater.sign(lockFundsTx, NemConst.NEMESIS_GENERATION_HASH);
    }

    function compareTx(tx: nem.Transaction, signedTx: nem.SignedTransaction): boolean {
        return tx.transactionInfo !== undefined && tx.transactionInfo.hash === signedTx.hash;
    }

    function announceMultisigTx(tx: nem.SignedTransaction, url: string): void {
        const txHttp = new nem.TransactionHttp(url);
        txHttp.announceAggregateBonded(tx).subscribe(
            res => console.log(`MultisigTx ( AggregateTx ) announced. hash:${tx.hash} , msg:${res.message}`),
            err => console.log(`Error\n${err}`),
        );
    }

    function announceCosigTx(tx: nem.CosignatureSignedTransaction, url: string): void {
        const txHttp = new nem.TransactionHttp(url);
        txHttp.announceAggregateBondedCosignature(tx).subscribe(
            res => console.log(`CosigTx announced cosigner:${tx.signer} , msg:${res.message}`),
            err => console.log(`Error\n${err}`),
        );
    }

    function createAndAnnounceCosigTx(cosigner: nem.Account, announcedAggregateTx: nem.AggregateTransaction, url: string): void {
        // create Unsigned cosigTx
        const cosigTx = nem.CosignatureTransaction.create(announcedAggregateTx);
        // cosigners sign into Unsigned cosigTx
        const signedCosigTx = cosigner.signCosignatureTransaction(cosigTx);
        // send
        announceCosigTx(signedCosigTx, url);
    }
}
