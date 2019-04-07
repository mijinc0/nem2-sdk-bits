import {
  PublicAccount, UInt64, NetworkType, MosaicId, MosaicNonce
} from 'nem2-sdk'

// calc nemesis modaic id
const netType = NetworkType.MIJIN_TEST

const nemesisPubKey = '238229C30DFBEA7A63B2C49D6A69FFE877A96773797CA244B5EE05DD53466477';

const nemesisAcc    = PublicAccount.createFromPublicKey( nemesisPubKey , netType );

const mosaicNonce   = MosaicNonce.createFromHex( '00000000' );

const xemMosaicId   = MosaicId.createFromNonce( mosaicNonce , nemesisAcc );

console.log( 'calculatedMosaicID : %s' , xemMosaicId.toHex() );
