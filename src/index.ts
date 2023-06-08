import { insertBlock, insertTx, insertClause } from './insert'
import { create } from './db'

let currentBlock = 0

async function fetchBlock(number: number) {
  const resp = await fetch(`${process.env.NODE}/blocks/${number}?expanded=true`)
  const b = await resp.json()
  await insertBlock(b)
  await insertTx(b)
  await insertClause(b)
}

async function runSync() {
  for (; ;) {
    await fetchBlock(currentBlock)
    currentBlock++
  }
}
create()
runSync()