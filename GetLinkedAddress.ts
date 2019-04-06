// get linked address

import { NamespaceHttp, NamespaceId, MosaicId } from 'nem2-sdk'

const endpoint = new NamespaceHttp( 'http://localhost:3000' );

const namespaceId = new NamespaceId( 'cat.currency' );

endpoint.getLinkedAddress( namespaceId ).subscribe(
  x => console.log( x ),
  err => console.log( err ),
);
