import { DataTypes, Sequelize, Dialect } from 'sequelize'

export const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PW, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_TYPE as Dialect,
  logging: false
})


export const Clause = sequelize.define('Clause', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER.UNSIGNED
  },
  txID: {
    type: DataTypes.STRING
  },
  index: {
    type: DataTypes.INTEGER
  },
  to: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'clause'
})
export const Event = sequelize.define('Event', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER.UNSIGNED
  },
  clauseID: {
    type: DataTypes.INTEGER
  },
  index: {
    type: DataTypes.INTEGER
  },
  contractAddr: {
    type: DataTypes.STRING,
    allowNull: true
  },
  topic0: {
    type: DataTypes.STRING,
    allowNull: false
  },
  topic1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  topic2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  topic3: {
    type: DataTypes.STRING,
    allowNull: true
  },
  topic4: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'event'
})

export const Transfer = sequelize.define('Transfer', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER.UNSIGNED
  },
  clauseID: {
    type: DataTypes.INTEGER
  },
  index: {
    type: DataTypes.INTEGER
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'transfer'
})

export const ContractCreation = sequelize.define('ContractCreation', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER.UNSIGNED
  },
  clauseID: {
    type: DataTypes.INTEGER
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'contractCreation'
})
export const Tx = sequelize.define('Tx', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  index: {
    type: DataTypes.INTEGER
  },
  blockID: {
    type: DataTypes.STRING
  },
  chainTag: {
    type: DataTypes.INTEGER
  },
  blockRef: {
    type: DataTypes.STRING
  },
  expiration: {
    type: DataTypes.INTEGER({length: 10, unsigned: true})
  },
  gasPriceCoef: {
    type: DataTypes.INTEGER
  },
  gas: {
    type: DataTypes.INTEGER
  },
  origin: {
    type: DataTypes.STRING
  },
  delegator: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nonce: {
    type: DataTypes.STRING,
  },
  dependsOn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER
  },
  gasUsed: {
    type: DataTypes.INTEGER
  },
  gasPayer: {
    type: DataTypes.STRING
  },
  paid: {
    type: DataTypes.STRING
  },
  reward: {
    type: DataTypes.STRING
  },
  reverted: {
    type: DataTypes.BOOLEAN
  }
}, {
  tableName: 'tx'
})

export const Block = sequelize.define('Blcok', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  number: {
    type: DataTypes.INTEGER
  },
  beneficiary: {
    type: DataTypes.STRING
  },
  gasLimit: {
    type: DataTypes.INTEGER
  },
  gasUsed: {
    type: DataTypes.INTEGER
  },
  isTrunk: {
    type: DataTypes.BOOLEAN
  },
  com: {
    type: DataTypes.BOOLEAN
  },
  parentID: {
    type: DataTypes.STRING
  },
  receiptsRoot: {
    type: DataTypes.STRING
  },
  signer: {
    type: DataTypes.STRING
  },
  size: {
    type: DataTypes.INTEGER
  },
  stateRoot: {
    type: DataTypes.STRING
  },
  timestamp: {
    type: DataTypes.INTEGER
  },
  totalScore: {
    type: DataTypes.INTEGER
  },
  txsFeatures: {
    type: DataTypes.INTEGER
  },
  txsRoot: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'block'
})

export const Status = sequelize.define('Status', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER.UNSIGNED
  },
  key: {
    type: DataTypes.STRING,
    unique: true
  },
  value: DataTypes.STRING,
}, {
  tableName: 'status'
})

export async function create(force: boolean) {
  await Clause.sync({force})
  await Event.sync({force})
  await Transfer.sync({force})
  await ContractCreation.sync({force})
  await Tx.sync({force})
  await Block.sync({force})
  await Status.sync({force})
}