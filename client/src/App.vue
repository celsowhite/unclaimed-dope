<template>
  <header class="page-header wysiwyg" v-if="assets.length > 0">
    <h1>Unclaimed Dope</h1>
    <p>
      Found {{ assets.length }}
      <a href="https://opensea.io/collection/dope-v4" target="_blank">$DOPE</a>
      for sale with unclaimed paper. The floor price is
      {{ assets[0].price }} ETH.
    </p>
    <p class="small">Last check was {{ lastChecked }}</p>
  </header>

  <ul class="toggles">
    <li @click="changeView('grid')" :class="{ active: view === 'grid' }">
      Grid
    </li>

    <li @click="changeView('table')" :class="{ active: view === 'table' }">
      Table
    </li>
  </ul>

  <div class="table" v-if="view === 'table'">
    <div class="table-header">
      <div class="table-row">
        <div class="table-column">
          ID
        </div>
        <div class="table-column">
          Price (ETH)
        </div>
      </div>
    </div>

    <div class="table-body">
      <div class="table-row" v-for="asset in assets" :key="asset.id">
        <div class="table-column">
          <a
            :href="
              `https://opensea.io/assets/0x8707276df042e89669d69a177d3da7dc78bd8723/${asset.id}`
            "
            target="_blank"
            >#{{ asset.id }}</a
          >
        </div>
        <div class="table-column">
          {{ asset.price }}
        </div>
      </div>
    </div>
  </div>

  <div class="asset-grid" v-else>
    <a
      v-for="asset in assets"
      :key="asset.id"
      :href="
        `https://opensea.io/assets/0x8707276df042e89669d69a177d3da7dc78bd8723/${asset.id}`
      "
      target="_blank"
      class="asset-grid-item"
    >
      <img :src="asset.image" />
      <div class="asset-grid-item__info">
        <p>#{{ asset.id }}</p>
        <p>{{ asset.price }} ETH</p>
      </div>
    </a>
  </div>
</template>

<script>
  import { initializeApp } from "firebase/app";
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  import format from "date-fns/format";
  import fromUnixTime from "date-fns/fromUnixTime";
  import Web3 from "web3";

  export default {
    name: "App",
    data() {
      return {
        assets: [],
        lastChecked: null,
        view: "grid",
      };
    },
    mounted: async function() {
      // Init App
      const app = initializeApp({
        apiKey: "AIzaSyCkCE7lytDW1GWAh8lpclp_VyzMD8Ib6hs",
        authDomain: "unclaimed-dope.firebaseapp.com",
        projectId: "unclaimed-dope",
        storageBucket: "unclaimed-dope.appspot.com",
        messagingSenderId: "514554732145",
        appId: "1:514554732145:web:31378f77744f3a8a9c45d0",
      });

      // Get Data
      const db = getFirestore();
      const docRef = doc(db, "checks", "main");
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      // Save the assets
      this.assets = data.found
        .map((asset) => {
          return {
            id: asset.id,
            image: asset.image,
            price: Web3.utils.fromWei(Math.floor(asset.price).toString()),
          };
        })
        .sort((a, b) => {
          return a.price - b.price;
        });

      // Save the last checked date.
      const lastCheckedDate = fromUnixTime(data.last_check / 1000);
      const lastCheckedFormatted = format(
        lastCheckedDate,
        "yyyy-MM-dd HH:mm:ss"
      );
      this.lastChecked = lastCheckedFormatted;
    },
    methods: {
      changeView(view) {
        this.view = view;
      },
    },
  };
</script>

<style>
  body {
    background: #000000e0;
    color: white;
    font-family: Inconsolata, ui-monospace, SFMono-Regular, Menlo, Monaco,
      Consolas, Liberation Mono, Courier New, monospace;
    margin: 0;
    padding: 100px 0;
  }

  body a {
    color: white;
  }

  h1,
  h2,
  h3 {
    font-weight: normal;
  }

  p.small {
    font-size: 0.8em;
  }

  .page-header {
    text-align: center;
    max-width: 800px;
    width: 90%;
    margin: 0 auto 50px;
  }

  ul.toggles {
    padding: 0;
    margin: 0;
    display: flex;
    text-align: center;
    max-width: 500px;
    margin: 0 auto 50px;
    justify-content: center;
    list-style: none;
  }

  ul.toggles li {
    padding: 0 20px;
    cursor: pointer;
  }

  ul.toggles li.active {
    text-decoration: underline;
  }

  .asset-grid {
    display: grid;
    grid-column: 0 0 2;
    grid-template-columns: auto auto auto;
    gap: 20px;
    max-width: 1200px;
    width: 90%;
    margin: 0 auto;
  }

  .asset-grid-item {
    position: relative;
    display: block;
    border: 1px solid white;
  }

  .asset-grid-item__info {
    position: absolute;
    width: 100%;
    bottom: 20px;
    color: white;
    text-align: center;
  }

  .asset-grid-item__info p {
    margin-bottom: 2px;
    line-height: 1;
  }

  .table {
    max-width: 500px;
    width: 90%;
    margin: 0 auto;
  }

  .table-row {
    display: flex;
  }

  .table-column {
    width: 50%;
    border-left: 1px solid;
    border-bottom: 1px solid;
    text-align: center;
    padding: 10px 0;
  }

  .table-header .table-column {
    border-top: 1px solid;
    font-weight: bold;
  }

  .table-column:last-child {
    border-right: 1px solid;
  }

  @media all and (max-width: 768px) {
    body {
      padding: 50px 0;
    }

    .asset-grid {
      grid-template-columns: auto;
    }
  }
</style>
