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

var accounts, networkId, address, factory, campaign, details, raised, imgUrl;

async function getAccounts() {
  const url = window.location.search;
  const urlPramas = new URLSearchParams(url);
  address = urlPramas.get("address");
  accounts = await web3.eth.getAccounts();
  networkId = await web3.eth.net.getId();
  campaign = new web3.eth.Contract(Campaign.abi, address);

  details = await campaign.methods.getSummary().call();
  raised = await campaign.methods.getRaised().call();
  imgUrl = await campaign.methods.getImage().call();

  console.log(details);

  document.getElementById("account").innerHTML = accounts[0];

  document.getElementById("title").innerHTML = details[0];
  document.getElementById("description").innerHTML = details[1];
  const goal = web3.utils.fromWei(details[3], "ether");
  raised = web3.utils.fromWei(raised, "ether");
  const balance = web3.utils.fromWei(details[5], "ether");
  var percentage = (raised / goal) * 100;

  console.log(details[9], accounts[0]);
  console.log(goal, raised, percentage);
  var progressBar = `<div
  class="progress-bar"
  role="progressbar"
  style="width: ${percentage}%"
  aria-valuenow="${percentage}%"
  aria-valuemin="0"
  aria-valuemax="100"
    ></div>`;

  document.getElementById("image").src = imgUrl;
  document.getElementById("progress").innerHTML = progressBar;
  document.getElementById("goal").innerHTML = goal + " eth";
  document.getElementById("raised").innerHTML = raised + " eth";
  document.getElementById("balance").innerHTML = balance + " eth";

  //manager address
  if (details[9] != accounts[0]) {
    document.getElementById("request").remove();
    document.getElementById("profit").remove();
    if (details[4]) {
      //campaign complete
      document.getElementById("contribute").remove();
    } else {
      $("#pay").click(async function () {
        await contribute();
      });
    }
    if (details[8] == 1 && details[10].includes(accounts[0])) {
      var req = await campaign.methods.getRequest().call();
      document.getElementById("req-des").innerHTML = req[0];
      var amt = web3.utils.fromWei(req[1], "ether");
      document.getElementById("req-amt").innerHTML = amt;
      document.getElementById("req-count").innerHTML = `${req[2]}/${req[3]}`;
      var check = await campaign.methods
        .isApproved()
        .call({ from: accounts[0] });
      console.log(check, "check");
      if (check) {
        document.getElementById("approve").innerHTML = "Request Approved";
        document.getElementById("approve").disable = true;
      } else {
        document.getElementById("approve").innerHTML = "Approve Request";
        $("#approve").click(async function () {
          await campaign.methods.approveRequest().send({ from: accounts[0] });
          location.reload();
        });
      }
    } else {
      document.getElementById("request-card").remove();
    }
  } else {
    document.getElementById("contribute").remove();
    if (details[4]) {
      $("#pay-profit").click(async function () {
        await payProfit();
      });
    } else {
      document.getElementById("profit").remove();
    }
    if (details[8] != 1) {
      document.getElementById("request-card").remove();
      if (balance > 0) {
        $("#pay-request").click(async function () {
          await createRequest();
          location.reload(true);
        });
      } else {
        document.getElementById("request").remove();
      }
    } else {
      document.getElementById("request").remove();
      var req = await campaign.methods.getRequest().call();
      document.getElementById("req-des").innerHTML = req[0];
      var amt = web3.utils.fromWei(req[1], "ether");
      document.getElementById("req-amt").innerHTML = amt;
      document.getElementById("req-count").innerHTML = `${req[2]}/${req[3]}`;
      if (parseInt(req[2]) < parseInt(req[3])) {
        document.getElementById("approve").innerHTML = "Pending Approval";
        document.getElementById("approve").disable = true;
      } else {
        document.getElementById("approve").innerHTML = "Checkout";
        $("#approve").click(async function () {
          await campaign.methods.finalizeRequest().send({ from: accounts[0] });
          location.reload(true);
        });
      }
    }
  }
}

async function createRequest() {
  var reason = document.getElementById("request-reason").value;
  var pay = document.getElementById("request-amt").value;
  pay = web3.utils.toWei(pay, "ether");
  await campaign.methods
    .createRequest(reason, pay, accounts[0])
    .send({ from: accounts[0] });
  await update();
}

async function payProfit() {
  var pay = document.getElementById("profit-amt").value;
  var payPer = Math.floor(pay / parseInt(details[6]));
  pay = web3.utils.toWei(pay.toString(), "ether");
  console.log(payPer, "payPer");
  payPer = web3.utils.toWei(payPer.toString(), "ether");
  console.log(payPer, "payper2");
  var payList = Array(parseInt(details[6])).fill(payPer);
  console.log(payList);
  await campaign.methods.createProfit().send({ value: pay, from: accounts[0] });
  await campaign.methods.finalizeProfit(payList).send({ from: accounts[0] });
  await update();
}

async function update() {
  details = await campaign.methods.getSummary().call();
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
}

async function contribute() {
  var pay = document.getElementById("contri-amt").value;
  pay = web3.utils.toWei(pay, "ether");
  await campaign.methods.contribute().send({ value: pay, from: accounts[0] });
  await update();
}

window.addEventListener("load", async () => {
  await getAccounts();
});
