// 블록 구조가 유효한지, 현재 블록의 인덱스가 이전 블록의 인덱스보다 1만큼 큰지,
// 이전 블록의 해시값과 현재 블록의 이전 해시가 같은지, 데이터 필드로부터 계산한 머클루트와 블록 헤더의 머클루트가 동일한지 이렇게 총 4가지를 검증한다.

const { getLastBlock, createHash, Blocks, nextBlock, getVersion } = require('./chainedBlock')
const fs = require("fs");
const merkle = require("merkle");
const cryptojs = require("crypto-js");

function isValidBlockStructure(block) {
  return typeof (block.header.version) === 'string'
    && typeof (block.header.index) === 'number'
    && typeof (block.header.previousHash) === 'string'
    && typeof (block.header.timestamp) === 'number'
    && typeof (block.header.merkleRoot) === 'string'
    && typeof (block.data) === 'object'
}

function isValidNewBlock(newBlock, previousBlock) {
  if (isValidBlockStructure(newBlock) === false) {
    console.log('Invalid Block Structure')
    return false
  } else if (newBlock.header.index !== previousBlock.header.index + 1) {
    console.log('Invlaid Index')
    return false
  } else if (createHash(previousBlock) !== newBlock.header.previousHash) {
    console.log('Invalid previousHash')
    return false
  } else if (newBlock.data.length === 0 && ('0'.repeat(64) !== newBlock.header.merkleRoot)
    || newBlock.data.length !== 0 && (merkle('sha256').sync(newBlock.data).root() !== newBlock.header.merkleRoot)) {
    console.log('Invalid merkleRoot')
    return false
  }
  return true
}

function addBlock(newBlock) {
  if (isValidNewBlock(newBlock, getLastBlock())) {
    Blocks.push(newBlock)
    return true
  }
  return false
}

const block = nextBlock(['성현이 바보'])
addBlock(block)

console.log(Blocks)


module.exports = { Blocks, addBlock, nextBlock, createHash, getVersion }