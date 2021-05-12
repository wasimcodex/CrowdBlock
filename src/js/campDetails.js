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

var accounts, networkId, address, factory, campaigns, details;

async function getAccounts() {
  const url = window.location.search;
  const urlPramas = new URLSearchParams(url);
  address = urlPramas.get("address");
  accounts = await web3.eth.getAccounts();
  networkId = await web3.eth.net.getId();
  factory = new web3.eth.Contract(Campaign.abi, address);

  details = await factory.methods.getSummary().call();
  console.log(details);

  document.getElementById("account").innerHTML = accounts[0];

  document.getElementById("title").innerHTML = details[0];
  document.getElementById("description").innerHTML = details[1];
  const goal = web3.utils.fromWei(details[3], "ether");
  const balance = web3.utils.fromWei(details[5], "ether");
  var percentage = (balance / goal) * 100;

  console.log(details[9], accounts[0]);
  console.log(goal, balance, percentage);
  var progressBar = `<div
  class="progress-bar"
  role="progressbar"
  style="width: ${percentage}%"
  aria-valuenow="${percentage}%"
  aria-valuemin="0"
  aria-valuemax="100"
    ></div>`;

  document.getElementById("progress").innerHTML = progressBar;
  document.getElementById("goal").innerHTML = goal + " eth";
  document.getElementById("raised").innerHTML = balance + " eth";

  if (details[9] != accounts[0]) {
    document.getElementById("request").remove();
    document.getElementById("profit").remove();
  }
}

window.addEventListener("load", async () => {
  await getAccounts();
});
