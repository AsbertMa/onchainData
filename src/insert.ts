import { Block, Clause, Tx, Event, Transfer, ContractCreation, Status } from './db'
import { Transaction } from 'sequelize'

export async function insertBlock(block: any, t: Transaction) {
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
  await Block.upsert(b, {transaction: t})
}

export async function insertTx(block: any, t: Transaction) {
  for (const [i, item] of block.transactions.entries()) {
    const tx = {
      id: item.id,
      index: i,
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
    await Tx.upsert(tx, {transaction: t})
  }
}

export async function insertStatus(key: string, value: string) {
  const data = {
    key,
    value
  }

  await Status.upsert(data)
}

export async function insertClause(block: any, t: Transaction) {
  // let clauses = []
  // let contractCreationList = []
  // let events = []
  // let transfers = []

  for (const tx of block.transactions) {
    const outputs = tx.outputs
    for (const [ci, item] of tx.clauses.entries()) {
      const clause = {
        txID: tx.id,
        index: ci,
        to: item.to,
        data: item.data,
        value: item.value,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      const temp: any = await Clause.create(clause, {transaction: t})
      const clauseID = temp.id
      if (outputs.length) {
        // contract creation
        if (outputs[ci].contractAddress) {

          const contractCreation = {
            clauseID,
            address: outputs[ci].contractAddress
          }

          await ContractCreation.create(contractCreation, {transaction: t})
        }

        // events
        for (const [ei, item] of outputs[ci].events.entries()) {
          const event = {
            clauseID,
            index: ei,
            contractAddr: item.address,
            data: item.data,
            topic0: item.topics[0],
            topic1: item.topics[1],
            topic2: item.topics[2],
            topic3: item.topics[3],
            topic4: item.topics[4]
          }

          await Event.create(event, {transaction: t})
        }

        // transfers
        for (const [ti, item] of outputs[ci].transfers.entries()) {
          const transfer = {
            clauseID,
            index: ti,
            sender: item.sender,
            recipient: item.recipient,
            amount: item.amount
          }

          await Transfer.create(transfer, {transaction: t})
        }
      }
    }
  }
}