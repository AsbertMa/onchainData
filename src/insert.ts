import { Block, Clause, Tx, Event, Transfer, ContractCreation, Status } from './db'

export async function insertBlock(block: any) {
  const b = {
    id: block.id,
    number: block.number,
    beneficiary: block.beneficiary,
    gasLimit: block.gasLimit,
    gasUsed: block.gasUsed,
    com: block.com,
    isTrunk: block.isTrunk,
    parentID: block.parentID,
    receiptsRoot: block.receiptsRoot,
    signer: block.signer,
    size: block.size,
    stateRoot: block.stateRoot,
    timestamp: block.timestamp,
    totalScore: block.totalScore,
    txsFeatures: block.txsFeatures,
    txsRoot: block.txsRoot,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await Block.upsert(b)
}

export async function insertTx(block: any) {
  block.transactions.forEach(async (item: any, index: number) => {
    const tx = {
      id: item.id,
      index: index,
      blockID: block.id,
      chainTag: item.chainTag,
      delegator: item.delegator,
      dependsOn: item.dependsOn,
      expiration: item.expiration,
      gas: item.gas,
      gasPayer: item.gasPayer,
      gasPriceCoef: item.gasPriceCoef,
      nonce: item.nonce,
      origin: item.origin,
      paid: item.paid,
      gasUsed: item.gasUsed,
      reverted: item.reverted,
      reward: item.reward,
      size: item.size,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await Tx.upsert(tx)
  })
}

export async function insertStatus(key: string, value: string) {
  const data = {
    key,
    value
  }

  Status.upsert(data)
}

export async function insertClause(block: any) {
  block.transactions.forEach((tx: any) => {
    const outputs = tx.outputs
    tx.clauses.forEach(async (clause: any, index: number) => {
      const item = Clause.build({
        txID: tx.id,
        index: index,
        to: clause.to,
        data: clause.data,
        value: clause.value,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      const temp: any = await item.save()
      const clauseID: number = temp.id

      if (outputs.length) {
        // contract creation
        if (outputs[index].contractAddress) {
          const ca = ContractCreation.build({
            clauseID,
            address: outputs[index].contractAddress
          })

          await ca.save()
        }
        // events
        outputs[index].events.forEach(async (item: any, ei: number) => {
          const event = Event.build({
            clauseID,
            index: ei,
            contractAddr: item.address,
            data: item.data,
            topic0: item.topics[0],
            topic1: item.topics[1],
            topic2: item.topics[2],
            topic3: item.topics[3],
            topic4: item.topics[4]
          })

          await event.save()
        })

        // transfer
        outputs[index].transfers.forEach(async (item: any, ti: number) => {
          const transfer = Transfer.build({
            clauseID,
            index: ti,
            sender: item.sender,
            recipient: item.recipient,
            amount: item.amount
          })
          await transfer.save()
        })
      }

    })
  })
}