const fs = require("fs");
const merkle = require("merkle");
const cryptojs = require("crypto-js");
const random = require('random')

const BLOCK_GENERATION_INTERVAL = 10  // 단위는 sec
const DIFFICULTY_ADJUST_INTERVAL = 10 // in blocks

class Block {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }
}

class BlockHeader {
  constructor(
    version,
    index,
    previousBlockHash,
    merkleRoot,
    timestamp,
    difficulty,
    nonce
  ) {
    this.version = version;
    this.index = index;
    this.previousBlockHash = previousBlockHash;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

function getVersion() {
  const package = fs.readFileSync("package.json");
  // console.log(JSON.parse(package).version);
  return JSON.parse(package).version;
}

function createGenesisBlock() {
  const version = getVersion();
  const index = 0;
  const previousBlockHash = "0".repeat(64);
  //const timestamp = parseInt(Date.now() / 1000); // Date.now() : milliseconds
  const timestamp = 1231006505 // 2009/03/01 18:15 (UTC)
  const body = ['The Times 03/Jan/2009 Chancellor on brink of second bailout for banks'] // bitcoin
  const tree = merkle("sha256").sync(body);
  const merkleRoot = tree.root() || "0".repeat(64);
  const difficulty = 0;
  const nonce = 0;

  const header = new BlockHeader(
    version,
    index,
    previousBlockHash,
    merkleRoot,
    timestamp,
    difficulty,
    nonce
  );

  return new Block(header, body);
}

let Blocks = [createGenesisBlock()];

function getBlocks() {
  return Blocks;
}

function getLastBlock() {
  return Blocks[Blocks.length - 1];
}

function createHash(data) {
  const {
    version,
    index,
    previousBlockHash,
    merkleRoot,
    timestamp,
    difficulty,
    nonce,
  } = data.header;
  const blockString =
    version + index + previousBlockHash + merkleRoot + timestamp + difficulty + nonce;
  const hash = cryptojs.SHA256(blockString).toString();
  return hash;
}

function nextBlock(bodyData) {
  const prevBlock = getLastBlock();
  const version = getVersion();
  const index = prevBlock.header.index + 1;
  const previousBlockHash = createHash(prevBlock);
  const timestamp = parseInt(Date.now() / 1000);
  const tree = merkle("sha256").sync(bodyData);
  const merkleRoot = tree.root() || "0".repeat();
  const difficulty = 0;
  // const nonce = 0;

  const header = findBlock(version, index, previousBlockHash, merkleRoot, timestamp, difficulty);
  return new Block(header, bodyData)
}

function addBlock(bodyData) {
  const newBlock = nextBlock(bodyData);
  Blocks.push(newBlock);
}

function replaceChain(newBlocks) {
  if (isValidChain(newBlocks)) {
    if ((newBlocks.length > Blocks.length) ||
      (newBlocks.length === Blocks.length) && randomBytes.boolean()) {
      Blocks = newBlocks
      broadcast(responseLatestMsg())
    }
  }
  else {
    console.log("받은 원장에 문제가 있음.")
  }
}

function hexToBinary(s) {
  const lookupTable = {
    '0': '0000',
    '1': '0001',
    '2': '0010',
    '3': '0011',
    '4': '0100',
    '5': '0101',
    '6': '0110',
    '7': '0111',
    '8': '1000',
    '9': '1001',
    'A': '1010',
    'B': '1011',
    'C': '1100',
    'D': '1101',
    'E': '1110',
    'F': '1111',
  }

  var ret = '';
  for (var i = 0; i < s.length; i++) {
    if (lookupTalbe[s[i]]) {
      ret += lookupTable[s[i]]
    }
    else { return null }
  }
  return ret
}

function hashMatchesDifficulty(hash, difficulty) {
  const hashBinary = nexToBinary(hash.toUppercase())
  const requirePrefix = '0'.repeat(difficulty)
  hashBinary.startsWith(requirePrefix)
}

function findBlock(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty) {
  var nonce = 0
  while (true) {
    var hash = calculateHash(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, nonce)

    if (hashMatchesDifficulty(hash, difficulty)) {
      return new BlockHeader(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, nonce)
    }
    nonce++
  }
}

function getDifficulty(blocks) {
  const lastBlock = blocks[blocks.length - 1]
  if (lastBlock.header.index !== 0 &&
    lastBlock.header.index % DIFFICULTY_ADJUST_INTERVAL === 0) {
    return getAdjustDifficulty(lastBlock, blocks)
  }
  return lastBlock.header.difficulty
}

function getAdjustDifficulty(lastBlock, blocks) {
  const prevAdjustmentBlock = blocks[blocks.length - DIFFICULTY_ADJUST_INTERVAL]
  const elapsedTime = lastBlock.header.timestamp - prevAdjustmentBlock.header.timestamp
  const expectedTime = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUST_INTERVAL

  if (elapsedTime / 2 > expectedTime) {
    return prevAdjustmentBlock.header.difficulty + 1
  }
  else if (elapsedTime * 2 < expectedTime) {
    return prevAdjustmentBlock.header.difficulty - 1
  }
  else {
    return prevAdjustmentBlock.header.difficulty
  }
}

function getCurrentTimestamp() {
  return Math.round(Date().getTime() / 1000)
}

function isValidTimestamp(newBlock, prevBlock) {
  if (newBlock.header.timestamp - prevBlock.header.timestamp < 60) {
    return false
  }
  if (getCurrentTimestamp() - newBlock.header.timestamp < 60) {
    return false
  }
  return true
}

// const genesisBlock = createGenesisBlock();
// console.log(genesisBlock);

//const block1 = nextBlock(["transaction1"])
// console.log(block1);

// addBlock(['transaction2'])
// addBlock(['transaction3'])
// addBlock(['transaction4'])
// addBlock(['transaction5'])
// console.log(Blocks);

module.exports = { getLastBlock, createHash, getBlocks, Blocks, nextBlock, getVersion, addBlock, isValidTimestamp, hashMatchesDifficulty }