const CryptoJS = require("crypto-js");

class TxOut {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}
let txout1 = new TxOut(333, 50);
let txout2 = new TxOut(334, 51);

class TxIn {
  constructor(txOutId, txOutIndex, signature) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = signature;
  }
}
let txin1 = new TxIn(1, 2, 777);
let txin2 = new TxIn(2, 3, 777777);

class Transaction {
  constructor(id, txIns, txOuts) {
    this.id = id;
    this.txIns = txIns;
    this.txOuts = txOuts;
  }
}

const getTransactionId = (transaction) => {
  const txInContent = transaction.txIns
    .map((txIn) => txIn.txOutId + txIn.txOutIndex)
    .reduce((a, b) => a + b, "");

  const txOutContent = transaction.txOuts
    .map((txOut) => txOut.address + txOut.amount)
    .reduce((a, b) => a + b, "");

  return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

// 위의 map 과 reduce를 이해할 수 있는 예제코드를 짜보자.
// let newTransaction = new Transaction(1, [txin1, txin2], [txout1, txout2]);
// getTransactionId(newTransaction);
// console.log(getTransactionId(newTransaction));

// function generateTransaction() {
//     const trans = new Transaction();
//     trans.id = 1;
//     for (var i = 0; i < 5; i++) {
//       const txIn = new TxIn("Id : " + (i + 1), i, "");
//       trans.txIns.push(txIn);
//     }
//     for (var i = 0; i < 5; i++) {
//       const TxOut = new TxOut("address : " + (i + 1), 30);
//       trans.TxOuts.push(TxOut);
//     }
//     return trans;
//   }
//   const newTransaction = generateTransaction();
//   const { txInContent, txOutContent } = getTransactionId(newTransaction);
//   console.log(txInContent);
//   console.log(txOutContent);

const signTxIn = (transaction, txInIndex, privateKey, aUnspentTxOuts) => {
  const txIn = transaction.txInput[txInIndex];
  const dataToSign = transaction.id;
  const referencedUnspentTxOut = findUnspentTxOut(
    txIn.txOutId,
    txIn.txOutIndex,
    aUnspentTxOuts
  );
  const referencedAddress = referencedUnspentTxOut.address;
  const key = ec.keyFromPrivate(privateKey, "hex");
  const signature = toHexString(key.sign(dataToSign).toDER());
  return signature;
};

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

const updateUnspentTxOuts = (aTransactions, aUnspentTxOuts) => {
    const newUnspentTxOuts = aTransactions
        .map((t) => {
        return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
    })
        .reduce((a, b) => a.concat(b), []);
    const consumedTxOuts = aTransactions
        .map((t) => t.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));
    const resultingUnspentTxOuts = aUnspentTxOuts
        .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
        .concat(newUnspentTxOuts);
    return resultingUnspentTxOuts;
};