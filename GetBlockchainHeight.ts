import{
  BlockchainHttp
} from 'nem2-sdk'

const endpoint = new BlockchainHttp( 'http://localhost:3000' )

endpoint.getBlockchainHeight().subscribe(
  x => console.log( x ),
  err => console.log( err ),
)
