const ecdsa = require('elliptic') // 타원 곡선 디지털 서명 알고리즘
const ec = new ecdsa.ec("secp256k1")
const fs = require('fs')

const privateKeyLocation = "wallet/" + (process.env.PRIVATE_KEY || "default")
const privateKeyFile = privateKeyLocation + "/private_key"

function initWallet() {
  if (fs.existsSync(privateKeyFile)) {
    console.log("기존 지갑 private key 경로 : " + privateKeyFile)
    return
  }

  if (!fs.existsSync("wallet/")) {
    fs.mkdirSync("wallet/")
  }

  if (!fs.existsSync(privateKeyLocation)) {
    fs.mkdirSync(privateKeyLocation)
  }

  const newPrivateKey = generatePrivateKey()
  fs.writeFileSync(privateKeyFile, newPrivateKey)
  console.log("새로운 지갑 생성 private key 경로 : " + privateKeyFile)
}

function generatePrivateKey() {
  const keyPair = ec.genKeyPair()
  const privateKey = keyPair.getPrivate()

  return privateKey.toString(16)
}

function getPrivateKeyFromWallet() {
  const buffer = fs.readFileSync(privateKeyFile, "utf8")
  return buffer.toString()
}

function getPublicKeyFromWallet() {
  const privateKey = getPrivateKeyFromWallet()
  const key = ec.keyFromPrivate(privateKey, "hex")
  return key.getPublic().encode("hex")
}