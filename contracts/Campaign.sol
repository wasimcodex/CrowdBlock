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
    bool public goalReached;
    mapping(address => bool) public approvers;
    mapping(address => uint256) public contributors;
    address payable[] public payees;
    uint256 public approversCount;
    uint256 public profit;
    uint256 public numRequest = 0;
    Request public requests;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(
        string memory p_title,
        string memory p_description,
        uint256 minimum,
        uint256 goal,
        address campaignCreator
    ) public {
        title = p_title;
        projDescription = p_description;
        goalAmount = goal;
        goalReached = false;
        manager = campaignCreator;
        minimumContribution = minimum;
        profit = 0;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        contributors[msg.sender] = msg.value;
        payees.push(address(uint256(msg.sender)));

        approversCount++;

        if (goalAmount <= address(this).balance) {
            goalReached = true;
        }
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

    function approveRequest() public {
        require(approvers[msg.sender]);
        require(!requests.approvals[msg.sender]);

        requests.approvals[msg.sender] = true;
        requests.approvalCount++;
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

    function getRequest() public view returns (string memory, uint256) {
        return (requests.description, requests.value);
    }
}

contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    function createCampaign(
        string memory title,
        string memory description,
        uint256 minimum,
        uint256 goal
    ) public {
        Campaign newCampaign =
            new Campaign(title, description, minimum, goal, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }
}
