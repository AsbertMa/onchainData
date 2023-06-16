import { insertBlock, insertTx, insertClause, insertStatus } from './insert'
import { create } from './db'
import { syncInfos, fetchBlock } from './chainSync'

async function insert(block: any) {
  await insertBlock(block)
  await insertTx(block)
  await insertClause(block)
}

async function runSync(_sync: syncInfos) {
  const keyFinalized = 'finalized'
  for (; ;) {
    const finalized = _sync.getFinalized()
    let current = _sync.getNext()
    console.log('sync', current)
    if ( _sync.getBest() && (_sync.getBest().number as number) >= current) {
      console.log('sync', 'fetch ' + current)
      const block = await fetchBlock(current)
      await insert(block)
      await insertStatus(keyFinalized, finalized.id)
      
      if (current === _sync.getBest().number) {
        console.log('current', current)
        console.info('start listen from ', _sync.getBest().number)
        _sync.setNext(++current)

        _sync.onBest(
          async (best) => {
            let next = _sync.getNext()
            if (next === best) {
              const b = await fetchBlock(best)
              await insert(b)
              _sync.setNext(++next)
            } else if (next < best) {
              const discrepancy = best - next
              for(let i = 0; i <= discrepancy; i++) {
                const b = await fetchBlock(_sync.getNext())
                await insert(b)
                _sync.setNext(++next)
              }
            }
          }
        )

        _sync.onFinalized(async (blockId) => {
          await insertStatus(keyFinalized, blockId)
        })

        break
      }
      _sync.setNext(++current)
    }
  }
}


async function main() {
  await create(!!process.env.DB_FORCE)
  const _sync = await syncInfos()
  _sync.start()
  runSync(_sync)
}

main()