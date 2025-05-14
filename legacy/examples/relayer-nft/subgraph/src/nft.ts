import { BigInt } from "@graphprotocol/graph-ts"
import { NFT, Approval, ApprovalForAll, Transfer } from "../generated/NFT/NFT"
import { Token, User } from "../generated/schema"

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTransfer(event: Transfer): void {
    let token = Token.load(event.params.tokenId.toString())
    if (!token){
	let token = new Token(event.params.tokenId.toString())
	token.tokenID = event.params.tokenId
	token.owner = event.params.to.toHexString()
	token.save()
    }
    
    let user = User.load(event.params.to.toHexString())
    if (!user) {
	user = new User(event.params.to.toHexString())
	user.save()
    }
}
