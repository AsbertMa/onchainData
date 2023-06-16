export async function fetchBlock(number: number): Promise<any> {
  const resp = await fetch(`${process.env.THOR_NODE}/blocks/${number}?expanded=true`)
  return await resp.json()
}

async function getBestBlock(): Promise<any> {
  const resp = await fetch(`${process.env.THOR_NODE}/blocks/best`)
  return await resp.json()
}

async function getFinalizedBlock(): Promise<any> {
  const resp = await fetch(`${process.env.THOR_NODE}/blocks/finalized`)
  return await resp.json()
}

async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('end')
    }, time)
  })
}

export type syncInfos = {
  setNext: (number: number) => void
  getNext: () => number
  start: () => void
  getBest: () => any
  getFinalized: () => any
  onBest: (cb: (blockNumber: number) => Promise<void>) => void
  onFinalized: (cb: (blockId: string) => Promise<void>) => void
}

export async function syncInfos(): Promise<syncInfos> {
  let bestBlock: any = await getBestBlock()
  let finalized: any = await getFinalizedBlock()
  let nextBlock: number = parseInt(process.env.BLOCK_FROM!)

  let cbBest: any
  let cbFinalized: any

  function setBest(block: any) {
    bestBlock = block
    cbBest && cbBest(bestBlock.number)
  }

  function setFinalized(block: any) {
    finalized = block
    cbFinalized && cbFinalized(finalized.id)
  }

  async function task() {
    console.log("start")
    for (; ;) {
      const now = await getBestBlock()
      const nowFilalized = await getFinalizedBlock()
      if (bestBlock && now.id !== bestBlock.id) {
        console.log('set best', now)
        setBest(now)
      }
      if (finalized && nowFilalized.id !== finalized.id) {
        console.log('set finalized', nowFilalized)
        setFinalized(nowFilalized)
      }
      await sleep(2000)
    }
  }

  return {
    setNext: (number: number) => {
      nextBlock = number
    },
    getNext: () => {
      return nextBlock
    },
    start: () => {
      task()
    },
    getBest: () => {
      return bestBlock
    },
    getFinalized: () => {
      return finalized
    },
    onBest: (cb: (best: number) => Promise<void>) => {
      cbBest = cb
    },
    onFinalized: (cb: (blockId: string) => Promise<void>) => {
      cbFinalized = cb
    }
  }
}