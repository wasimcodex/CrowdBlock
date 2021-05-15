// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        mapping(address => bool) approvals;
        uint256 approvalCount;
    }

    address public manager;
    string public title;
    string public projDescription;
    uint256 public minimumContribution;
    uint256 public goalAmount;
    uint256 public moneyRaised;
    bool public goalReached;
    mapping(address => bool) public approvers;
    address payable[] public payees;
    uint256 public approversCount;
    uint256 public profit;
    uint256 public numRequest = 0;
    Request public requests;
    string public url;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(
        string memory p_title,
        string memory p_description,
        uint256 minimum,
        uint256 goal,
        address campaignCreator,
        string memory p_url
    ) public {
        title = p_title;
        projDescription = p_description;
        goalAmount = goal;
        goalReached = false;
        manager = campaignCreator;
        minimumContribution = minimum;
        url = p_url;
        profit = 0;
        moneyRaised = 0;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        payees.push(address(uint256(msg.sender)));

        approversCount++;
        moneyRaised = moneyRaised + msg.value;

        if (goalAmount <= moneyRaised) {
            goalReached = true;
        }
    }

    function getImage() public view returns (string memory) {
        return url;
    }

    function createRequest(
        string memory description,
        uint256 value,
        address payable recipientAdd
    ) public restricted {
        Request memory newRequest =
            Request({
                description: description,
                value: value,
                recipient: recipientAdd,
                complete: false,
                approvalCount: 0
            });
        requests = newRequest;
        numRequest = 1;
    }

    function getRaised() public view returns (uint256) {
        return moneyRaised;
    }

    function approveRequest() public {
        require(approvers[msg.sender]);
        require(!requests.approvals[msg.sender]);

        requests.approvals[msg.sender] = true;
        requests.approvalCount++;
    }

    function isApproved() public view returns (bool) {
        return requests.approvals[msg.sender];
    }

    function finalizeRequest() public payable {
        require(!requests.complete);
        require(requests.approvalCount > (approversCount / 2));

        requests.recipient.transfer(requests.value);
        requests.complete = true;
        numRequest = 0;
    }

    function getSummary()
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            bool,
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            address payable[] memory
        )
    {
        return (
            title,
            projDescription,
            minimumContribution,
            goalAmount,
            goalReached,
            address(this).balance,
            approversCount,
            profit,
            numRequest,
            manager,
            payees
        );
    }

    function createProfit() public payable restricted() {
        profit = msg.value;
    }

    function finalizeProfit(uint256[] memory pay) public payable restricted {
        for (uint256 i = 0; i < payees.length; i++) {
            payees[i].transfer(pay[i]);
        }
    }

    function getRequest()
        public
        view
        returns (
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            requests.description,
            requests.value,
            requests.approvalCount,
            approversCount
        );
    }
}

contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    function createCampaign(
        string memory title,
        string memory description,
        uint256 minimum,
        uint256 goal,
        string memory url
    ) public {
        Campaign newCampaign =
            new Campaign(title, description, minimum, goal, msg.sender, url);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }
}
