// get 'linked' mosaic id

import { NamespaceHttp, NamespaceId, MosaicId } from 'nem2-sdk'

const endpoint = new NamespaceHttp( 'http://localhost:3000' );

const namespaceId = new NamespaceId( 'cat.currency' );

endpoint.getLinkedMosaicId( namespaceId ).subscribe(
  x => console.log( x.toHex() ),
  err => console.log( err ),
);
