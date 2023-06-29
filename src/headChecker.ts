import { Block, sequelize } from './db'
import { insertBlock, insertTx, insertClause} from './insert'
import { fetchBlock } from './chainSync'

const maxCount = 12

export async function trunkCheck(bestNumber: any) {
  let theBlock = bestNumber - maxCount

  for(let i = 0; i < maxCount; i++) {
    const nodeBlock = await fetchBlock(theBlock)
    const dbBlock = await Block.findOne({
      where: {
        number: theBlock
      }
    })
    
    const _block = dbBlock?.get()
    if (nodeBlock.id !== _block.id) {
      const transaction = await sequelize.transaction()
      await dbBlock?.update({
        isTrunk: false
      })
      
      await insertBlock(nodeBlock, transaction)
      await insertTx(nodeBlock, transaction)
      await insertClause(nodeBlock, transaction)
      await transaction.commit()
    }

    theBlock++
  }
}