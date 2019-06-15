/*
[ usage ]
  $ ts-node ./AccountObserver.ts << observed address >> << option >>

[ option ]
  -v : verbose mode ( default:simple )

[ e.g. ]
  npx ts-node ./AccountObserver.ts SD4MQDCJ6WC6GTGUP2PWFORXZSERFG2UHBU7ZHOQ -v
*/

import * as nem from 'nem2-sdk';
import { Cli, CliAttr } from './share/Cli';
import { Util         } from './share/Util';
import { OptParse     } from './share/OptParse';


class AccountObserver {

  listener: nem.Listener;
  addr:     nem.Address;
  opt:      Map<string,string>


  constructor( addr: string, url: string, opt: Map<string,string> ){
    this.listener = new nem.Listener( url );
    this.addr = nem.Address.createFromRawAddress( addr );
    this.opt  = opt;
  }


  public open() :void {
    const cli = new Cli();

    const errorSubject = ( err: Error ) => { cli.error( err.message ) };

    cli.setHead('start AccountObserver');
    cli.flush();

    this.listener.open().then( () => {
      // Dropped
      this.listener.status( this.addr ).subscribe(
        txStateErr => { this.printTxErr( txStateErr ); },
        errorSubject,
      );
      // Confirmed
      this.listener.confirmed( this.addr ).subscribe(
        tx => { this.printNewTxInfo( tx ); },
        errorSubject,
      );
    });
  }


  private isKeyOfTxType( name: string ): name is keyof nem.TransactionType {
    return Object.keys( nem.TransactionType ).indexOf( name ) > -1;
  }


  private readableTxType( num: number ) :string {
    const keys = Object.keys( nem.TransactionType );

    const readable = keys.find( k => {
      // find key which matches num.
      if( this.isKeyOfTxType( k ) ) return nem.TransactionType[ k ] === num;
    });

    return Util.notUndefined( readable ) ? readable : 'unknown';
  }


  private isTransferTx( tx: nem.Transaction ) :tx is nem.TransferTransaction {
    return tx.type === nem.TransactionType.TRANSFER;
  }


  private isAggregateTx( tx: nem.Transaction ) :tx is nem.AggregateTransaction {
    return tx.type === nem.TransactionType.AGGREGATE_BONDED;
  }


  private extractTransferFromAggregateTx( aggregateTx: nem.AggregateTransaction ) :nem.TransferTransaction[] {
    return aggregateTx.innerTransactions
      .filter( inTx => { return this.isTransferTx( inTx ); })
      .map( inTx => { return <nem.TransferTransaction> inTx });
  }


  private extractTransfers( tx: nem.Transaction ) :nem.TransferTransaction[] {
    // when transfer
    if( this.isTransferTx( tx ) ){ return [ tx ]; }
    // when aggregate
    if( this.isAggregateTx( tx ) ){ return this.extractTransferFromAggregateTx( tx ); }

    // can not extract
    return new Array<nem.TransferTransaction>();
  }


  private isAddress( obj: any ) :obj is nem.Address {
    return obj.constructor.name === 'Address';
  }


  private isNamespaceId( obj: any ) :obj is nem.NamespaceId {
    return obj.constructor.name === 'NamespaceId';
  }


  private getRecipientFromTx( tx: nem.Transaction ) :string[] {
    // No recipient
    if( this.isTransferTx( tx ) === false ) return [''];

    // recipient can be Address or NamespaceId
    const recipient = this.isTransferTx( tx ) ? tx.recipient : '';

    if( this.isAddress( recipient ) ){
      return [ 'Address', recipient.plain() ];
    }else if( this.isNamespaceId( recipient ) ){
      return [ 'NamespaceId', recipient.toHex() ];
    }

    throw new Error( 'unexpected!' );
  }


  // for verbose
  private getTxBaseInfo( tx: nem.Transaction ) :Map<string,string> {
    const baseInfo = new Map<string,string>();

    const txInfo = tx.transactionInfo;
    baseInfo.set( 'type',   this.readableTxType( tx.type ) );
    baseInfo.set( 'height', Util.notUndefined( txInfo ) ? Util.hexStrToDecimalStr( txInfo.height.toHex() ) : 'unknown' )
    baseInfo.set( 'hash',   Util.notUndefined( txInfo ) ? txInfo.hash : 'unknown' )

    return baseInfo;
  }


  // for verbose
  private setBaseTxInfoIntoCli( baseInfo: Map<string,string>, cli: Cli ) :void {
    cli.setHead( 'NewConfirmedTransactionInfo' );
    cli.setLine( `type   : ${baseInfo.get('type')}` );
    cli.setLine( `height : ${baseInfo.get('height')}` );
    cli.setLine( `hash   : ${baseInfo.get('hash')}` );
  }


  // for verbose
  private setMosaicInfoIntoCli( mosaics: nem.Mosaic[], cli: Cli ) :void {
    // make summaries => "mosaicId:amount"
    const summaries = mosaics.map( m => {
      const id = m.id.toHex();
      const amount = Util.hexStrToDecimalStr( m.amount.toHex() );
      return `${id}${CliAttr.Color.Green}${amount}${CliAttr.Reset}`
    });

    const line = summaries.reduce( ( prev, cur ) => { return prev + ' ' + cur; } );
    cli.setLine( `  mosaic : ${line}` );
  }


  // for verbose
  private setTransferInfoIntoCli( transfers: nem.TransferTransaction[], cli: Cli ) :void {
    cli.setHead( 'TransferInfo' );
    transfers.forEach( transfer => {
      const recipient = this.getRecipientFromTx( transfer );
      cli.setLine( `> to     : ${recipient[0]} ${recipient[1]}` );
      cli.setLine( `  from   : ${transfer.signer.publicKey} (${transfer.signer.address.plain()})` );
      this.setMosaicInfoIntoCli( transfer.mosaics, cli );
    });
  }


  private printNewTxInfo( tx: nem.Transaction ) :void {
    const verbose = this.opt.has( 'verbose' );
    const cli = new Cli();

    const txBaseInfo = this.getTxBaseInfo( tx );
    const transfers  = this.extractTransfers( tx );

    if( verbose ){
      this.setBaseTxInfoIntoCli( txBaseInfo, cli );
      // if needed, print deal info
      if( transfers.length !== 0 ) this.setTransferInfoIntoCli( transfers, cli );
    }else{
      cli.setLine( `${txBaseInfo.get('height')} ${txBaseInfo.get('type')} ${txBaseInfo.get('hash')}`, false );
    }

    cli.flush();
  }


  private printTxErr( txStateErr: nem.TransactionStatusError ) :void {
    const cli = new Cli();
    cli.setLine(
      `TxDropped! [${txStateErr.hash}] ${txStateErr.status}`,
      false,
      CliAttr.Color.Red,
      CliAttr.Style.Bold
    );
    cli.flush();
  }
}



// region Exec //

function loadOption() :Map<string,string> {
  const optParse = new OptParse();

  const addrFinder = ( arg :string ) => { return Util.isAddressFormat( arg ) };
  optParse.subscribe( 'address', addrFinder );

  const verboseFinder = ( arg :string ) => { return (/^-v$/).test( arg ) };
  optParse.subscribe( 'verbose', verboseFinder );

  return optParse.parse();
}


const url  = 'http://localhost:3000';
const opt  = loadOption();
const addr = opt.get( 'address' );

if( Util.notUndefined( addr ) === false ) throw new Error( 'Address Not Found' );

const observer = new AccountObserver( addr, url, opt );

observer.open();
