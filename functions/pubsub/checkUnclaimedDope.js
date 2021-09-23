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
Check Unclaimed Dope
---------------------*/

exports.scheduledFunction = functions.pubsub
  .schedule("0 */6 * * *")
  .onRun(async (context) => {
    /*--------------
    Setup Web3
    --------------*/
    const dopeContractAddress = `0x8707276df042e89669d69a177d3da7dc78bd8723`;
    const paperContractAddress = `0x7aE1D57b58fA6411F32948314BadD83583eE0e8C`;
    const dopeCount = 8000;

    // Setup the provider.
    const web3 = new Web3(
      `https://mainnet.infura.io/v3/${functions.config().infura.id}`
    );

    // Get the $PAPER contract interface.
    const contract = new web3.eth.Contract(paperAbi, paperContractAddress);

    /*--------------
    Get Dope Assets
    --------------*/

    let allDopeAssets = [];
    let currentOffset = 0;

    function getDopeAssets(offset) {
      return new Promise(async (resolve, reject) => {
        const response = await axios.get(
          `https://api.opensea.io/api/v1/assets?asset_contract_address=${dopeContractAddress}&offset=${offset}&limit=50`
        );
        resolve(response.data.assets);
      });
    }

    // Query the Opensea api for batches of assets. Adjust the for loop to query less or more sets of data.
    for (let i = 0; i < dopeCount / 50; i++) {
      const offset = currentOffset;
      const assets = await getDopeAssets(offset);

      // Append these assets to the assets that we've already queried
      allDopeAssets = [...allDopeAssets, ...assets];
      currentOffset += 50;
    }

    // Get the Dope for sale.
    const dopeAssetsForSale = allDopeAssets
      .filter((asset) => {
        // Filter for just the dope on sale. The taker address is null.
        if (asset.sell_orders) {
          return (
            asset.sell_orders[0].taker.address ===
              "0x0000000000000000000000000000000000000000" &&
            asset.sell_orders[0].expiration_time === 0
          );
        } else {
          return false;
        }
      })
      // Only return the data we need.
      .map((asset) => {
        return {
          id: asset.token_id,
          price: asset.sell_orders[0].current_price,
          image: asset.image_url,
        };
      });

    /*--------------
    Check Paper
    --------------*/

    const dopeAssetsWithPaper = [];

    for (let i = 0; i < dopeAssetsForSale.length; i++) {
      const asset = dopeAssetsForSale[i];

      // Check if the asset has claimed its $PAPER (get that money)
      const claimed = await contract.methods
        .claimedByTokenId(asset.id)
        .call({}, function (error, result) {});

      // If not claimed then add it to our list.
      if (!claimed) {
        dopeAssetsWithPaper.push(asset);
      }
    }

    /*--------------
    Save the DOPE to the db.
    --------------*/

    await db.collection("checks").doc("main").update({
      last_check: new Date().getTime(),
      found: dopeAssetsWithPaper,
    });

    return null;
  });
