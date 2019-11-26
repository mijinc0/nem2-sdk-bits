import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'


const netType = NemConst.NETWORK_TYPE;
const generationHash = NemConst.NEMESIS_GENERATION_HASH;

//  private: 19BAAAE91FD8E7CC0C150576596011A7724949263265DB38F1695D167043D2D5
//   public: 65694ABDE9C387CBBBB83AA4E1CA55B46B18B7D76FD196DE02C9E4896872DC07
//  address: SBX3LDGGGBL6KGYQPNFW36FLV7FIF7R47F7QQ6Z5
const privateKey = '19BAAAE91FD8E7CC0C150576596011A7724949263265DB38F1695D167043D2D5';
const sender = nem.Account.createFromPrivateKey(privateKey, netType);
const address = 'SDMBVL5PUO5KBFYUCNJXJK3H6KBWM2TTZMX452O4';
const recipient = nem.Address.createFromRawAddress(address);

const amount = 100000;
const mosaicId = NemConst.CURRENCY_MOSAIC_ID;
const mosaic = new nem.Mosaic(new nem.MosaicId(mosaicId), nem.UInt64.fromUint(amount));
const mosaics = [mosaic];
const msg = 'this is test';

const transferTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  recipient,
  mosaics,
  nem.PlainMessage.create(msg),
  netType
);

const signedTx = sender.sign(transferTx, generationHash);

/* extract Signature */
const startIndexOfSignature = 4 * 2; //tx-size(4byte) - signature(64byte) -...
const signatureLength = 64 * 2; //64byte
const endIndexOfSignature = startIndexOfSignature + signatureLength;
const signature  = signedTx.payload.slice(startIndexOfSignature, endIndexOfSignature);
console.log(`signature : ${signature}`);

/* tx hash */
const transactionPayload = signedTx.payload;
const generationHashBuffer = Array.from(nem.Convert.hexToUint8(generationHash));
// ** pseudo code **
// txhash = Hash(
//     signature[0..31]
//   + signerPublicKey
//   + data following public key data
// )
const hash = nem.Transaction.createTransactionHash(
  transactionPayload,
  generationHashBuffer,
  netType
);
console.log(`hash : ${hash}`);
