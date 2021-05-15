var $ = require("jquery");
const Web3 = require("web3");
const Campaign = require("../../build/contracts/Campaign.json");
const CampaignFactory = require("../../build/contracts/CampaignFactory.json");

const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
window.web3 = web3;

var accounts, networkId, address, factory, campaigns, deployedNetwork;

async function getAccounts() {
  accounts = await web3.eth.getAccounts();
  networkId = await web3.eth.net.getId();
  deployedNetwork = CampaignFactory.networks[networkId];
  factory = new web3.eth.Contract(
    CampaignFactory.abi,
    deployedNetwork && deployedNetwork.address
  );
  document.getElementById("account").innerHTML = accounts[0];
  campaigns = await factory.methods.getDeployedCampaigns().call();
  console.log(campaigns);

  for (let i = campaigns.length - 1; i >= 0; i--) {
    await getCard(campaigns[i]);
  }
}

async function getCard(addr) {
  const camp = new web3.eth.Contract(Campaign.abi, addr);
  const details = await camp.methods.getSummary().call();
  const imgUrl = await camp.methods.getImage().call();
  const goal = web3.utils.fromWei(details[3], "ether");
  if (details[9] == accounts[0]) {
    var content = `<a
      href="http://127.0.0.1:5500/src/campaign.html?address=${addr}"
      style="text-decoration: none; color: black"
    >
      <div class="card border-dark mb-2" style="padding: 4px">
      <img
                class="card-img-top"
                src=${imgUrl}
                alt="Card image"
                style="max-height: 200px; max-width: 500"
              />
        <h5>${details[0]}</h5>
        <h6 style="color: green">Manager</h6>
        <p>
          ${details[1].slice(0, 100)}...
        </p>
        <p>Requests: ${details[8]}</p>
      </div>
    </a>`;
    document.getElementById("right-camp").innerHTML += content;
  } else if (details[10].includes(accounts[0])) {
    var content = `<a
    href="http://127.0.0.1:5500/src/campaign.html?address=${addr}"
    style="text-decoration: none; color: black"
  >
    <div class="card border-dark mb-2" style="padding: 4px">
    <img
                class="card-img-top"
                src=${imgUrl}
                alt="Card image"
                style="max-height: 200px; max-width: 500"
              />
      <h5>${details[0]}</h5>
      <h6 style="color: green">Contributor</h6>
      <p>
        ${details[1].slice(0, 100)}...
      </p>
      <p>Requests: ${details[8]}</p>
    </div>
  </a>`;
    document.getElementById("right-camp").innerHTML += content;
  } else {
    if (!details[4]) {
      var content = `<div class="card p-2 mb-2">
        <a
          class="card-block stretched-link text-decoration-none"
          style="color: black"
          href="http://127.0.0.1:5500/src/campaign.html?address=${addr}"
        >
          <img
            class="card-img-top"
            src=${imgUrl}
            alt="Card image"
            style="max-height: 300px; max-width: 500"
          />
          <h4 class="card-title">${details[0]}</h4>
          <p class="card-text">${details[1]}</p>
          <p class="card-footer">Goal: ${goal} eth</p>
        </a>
      </div>`;
      document.getElementById("left-camp").innerHTML += content;
    }
  }
}

window.addEventListener("load", async () => {
  await getAccounts();
});
