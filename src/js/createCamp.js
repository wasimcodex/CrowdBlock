var $ = require("jquery");
const Web3 = require("web3");
const Campaign = require("../../build/contracts/Campaign.json");
const CampaignFactory = require("../../build/contracts/CampaignFactory.json");

const { create } = require("ipfs-http-client");
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
window.web3 = web3;

var accounts, networkId, address, factory, campaigns, deployedNetwork;

address = "0x6f30a5c7a3EdA66F3f51ce4882f1Ee281cE6Fb9B";

async function getAccounts() {
  accounts = await web3.eth.getAccounts();
  networkId = await web3.eth.net.getId();
  deployedNetwork = CampaignFactory.networks[networkId];
  factory = new web3.eth.Contract(
    CampaignFactory.abi,
    deployedNetwork && deployedNetwork.address
  );

  campaigns = await factory.methods.getDeployedCampaigns().call();
  console.log(campaigns);

  document.getElementById("account").innerHTML = accounts[0];
  $("#create").click(async function () {
    await createCampaign();
  });
  $("#cancel").click(function () {
    window.location.replace("http://127.0.0.1:5500/src/home.html");
  });
}

async function createCampaign() {
  var title = document.getElementById("title").value;
  var descrip = document.getElementById("description").value;
  var image = document.getElementById("customFile").files[0];
  const hash = await ipfs.add(image);
  var url = "http://ipfs.infura.io/ipfs/" + hash.path;
  console.log(url);
  var goal = document.getElementById("goal").value;
  goal = goal + "000000000000000000";
  var min = document.getElementById("min").value;
  min = min + "000000000000000000";
  console.log(title, descrip, goal, min);

  await factory.methods
    .createCampaign(title, descrip, min, goal, url)
    .send({ from: accounts[0] });

  window.location.replace("http://127.0.0.1:5500/src/home.html");
}

window.addEventListener("load", async () => {
  await getAccounts();
});
