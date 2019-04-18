import { Util } from './Util';

interface Finder { ( arg: string ) :boolean }

export class OptParse {

  finders = new Map<string,Finder>();

  public subscribe( key: string, finder: Finder ) :void {
    this.finders.set( key, finder );
  }

  public parse() :Map<string,string> {

    const opt = new Map<string,string>();

    this.finders.forEach( ( finder, key ) => {
      const val = process.argv.find( finder );
      if( Util.notUndefined( val ) ) opt.set( key, val );
    });

    return opt;
  }
}
