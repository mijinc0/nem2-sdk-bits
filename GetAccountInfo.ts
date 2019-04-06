import { Account , Address , AccountHttp , NetworkType } from 'nem2-sdk'

const endpoint = new AccountHttp( 'http://localhost:3000' );

const address = Address.createFromRawAddress( 'SDZ2XARR6INLRAA2AYUP3RAOJ6RCKTZCQEV3GTKJ' )

endpoint.getAccountInfo( address ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
);
