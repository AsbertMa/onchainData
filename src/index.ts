import { insertBlock, insertTx, insertClause, insertStatus } from './insert'
import { create, sequelize } from './db'
import { trunkCheck } from './headChecker'
import { syncInfos, fetchBlock } from './chainSync'

async function insert(block: any) {
  const t = await sequelize.transaction()
  try {
    await insertBlock(block, t)
    await insertTx(block, t)
    await insertClause(block, t)
    await t.commit()
  } catch (error) {
    await t.rollback()
  }
}

async function runSync(_sync: syncInfos) {
  const keyFinalized = 'finalized'
  for (; ;) {
    const finalized = _sync.getFinalized()
    let current = _sync.getNext()
    if ( _sync.getBest() && (_sync.getBest().number as number) >= current) {
      const block = await fetchBlock(current)
      await insert(block)
      await insertStatus(keyFinalized, finalized.id)
      
      if (current === _sync.getBest().number) {
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

        _sync.onBest(trunkCheck)

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