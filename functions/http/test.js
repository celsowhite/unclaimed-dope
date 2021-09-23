/*---------------------
Libraries
---------------------*/

const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const db = firebaseAdmin.firestore();
const Web3 = require("web3");
const axios = require("axios");
const paperAbi = require("../abi/paper.abi");

/*---------------------
Charge Paid
---------------------*/

exports = module.exports = functions.https.onRequest(async (req, res) => {
  /* const dopeContractAddress = `0x8707276df042e89669d69a177d3da7dc78bd8723`;
  const paperContractAddress = `0x7aE1D57b58fA6411F32948314BadD83583eE0e8C`;
  const response = await axios.get(
    `https://api.opensea.io/api/v1/assets?asset_contract_address=${dopeContractAddress}&offset=0&limit=50&token_ids=3360&token_ids=2677`
  );

  console.log(
    response.data.assets.map((asset) => {
      return asset.sell_orders;
    })
  ); */
  res.status(200).send();
});
