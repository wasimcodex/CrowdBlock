var $ = require("jquery");
const Web3 = require("web3");
const Campaign = require("../../build/contracts/Campaign.json");
const CampaignFactory = require("../../build/contracts/CampaignFactory.json");

$(function () {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
  }
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    window.alert("Please use Metamask!");
  }
});

const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
window.web3 = web3;

var accounts, networkId, address, factory, campaigns;

async function getAccounts() {
  accounts = await web3.eth.getAccounts();
  networkId = await web3.eth.net.getId();
  address = "0x6579482Aaf0D77b241ea925Fac74E5DB62dcbCC6";
  factory = new web3.eth.Contract(CampaignFactory.abi, address);

  campaigns = await factory.methods.getDeployedCampaigns().call();
  console.log(campaigns);

  document.getElementById("account").innerHTML = accounts[0];
}

window.addEventListener("load", async () => {
  await getAccounts();
});
