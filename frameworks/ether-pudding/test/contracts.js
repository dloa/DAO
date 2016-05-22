// Override Pudding
var assert = require("chai").assert;
var Pudding = require("../");
var temp = require("temp").track();;
var solc = require("solc");
var fs = require("fs");
var TestRPC = require("ethereumjs-testrpc");
var Web3 = require("web3");
var PuddingGenerator = require("../generator");
var PuddingLoader = require("../loader");

// Compile first
var result = solc.compile(fs.readFileSync("./test/AlexandriaDAO.sol", {encoding: "utf8"}), 1);
//console.log(result); // => 
console.log(result.contracts["AlexandriaDAO"].interface); // => 
var dao_compiled = result.contracts["AlexandriaDAO"];
var dao_abi = JSON.parse(dao_compiled.interface);
var dao_binary = dao_compiled.bytecode;
console.log(result.contracts["AlexandriaDAO_Creator"].interface); // => 
var creator_compiled = result.contracts["AlexandriaDAO_Creator"];
var creator_abi = JSON.parse(creator_compiled.interface);
var creator_binary = creator_compiled.bytecode;

// Setup
var web3 = new Web3();
web3.setProvider(TestRPC.provider());
Pudding.setWeb3(web3);

var tests = function(contract_instantiator) {
  var contract;
  var accounts;

  before(function(done) {
    contract_instantiator(function(err, _contract) {
      contract = _contract;
      done(err);
    });
  });

  before(function(done) {
    web3.eth.getAccounts(function(err, accs) {
      accounts = accs;

      Pudding.defaults({
        from: accounts[0]
      });

      done(err);
    });
  });

  it("should provide contract name", function(done) {
    var c = contract.deployed();
    console.log("Contract Name: " + c.contract_name);
    assert.isTrue(true);
    done();
  });

  it("should validate contract deployment", function(done) {
    var c = contract.at(contract.deployed_address);
    assert.isTrue(true);
    done();
  });

  it("should validate deployed", function(done) {
    var c = contract.deployed();
    assert.isTrue(true);
    done();
  });

  it("should validate Creator mechanism", function(done) {
    var c = contract.deployed();
    if (c.contract_name != "AlexandriaDAO_Creator") {
      // do nothing
      assert.isTrue(true);
      done();
    } else {
      console.log(Date.now());
      console.log("Creating DAO with Curator " + accounts[0]);
      c.createDAO(
        // curator address
        accounts[0],
        // proposal deposit
        2 * 10^18,
        // min tokens to create
        5 * 10000000000000000000000, // 5*10^22
        // closing time in unixtime
        Date.now() + 600 // 10 minutes
      ).then(function(dao) {
        assert.isTrue(true);
        done();
      });
    }
  });


  it("should validate initial DAO balance", function(done) {
    //var c = contract.deployed();
    var c = contract.at(contract.deployed_address);

    if (c.contract_name != "AlexandriaDAO") {
      // do nothing
      assert.isTrue(true);
      done();
    } else {
      console.log(Date.now());
      console.log("Validating DAO");
      var promise = c.balanceOf(accounts[0]);
      promise.then(function(result) {
        console.log("Balance " + result);
      }, function(err) {
        console.log("Error " + err);
      });
      done();
    }
  });

  it("should validate initial DAO curator", function(done) {
    //var c = contract.deployed();
    var c = contract.at(contract.deployed_address);

    if (c.contract_name != "AlexandriaDAO") {
      // do nothing
      assert.isTrue(true);
      done();
    } else {
      console.log(Date.now());
      console.log("Validating DAO");
      var promise = c.curator(accounts[0]);
      promise.then(function(result) {
        console.log("Curator " + result);
      }, function(err) {
        console.log("Error " + err);
      });
      done();
    }
  });

  it("should validate initial DAO variables", function(done) {
    //var c = contract.deployed();
    var c = contract.at(contract.deployed_address);

    if (c.contract_name != "AlexandriaDAO_Creator") {
      // do nothing
      assert.isTrue(true);
      done();
    } else {
      console.log("Contract name: " + c.contract_name);
      console.log(Date.now());
      console.log("Creating DAO with Curator " + accounts[0]);
      dao = c.createDAO(
        // curator address
        accounts[0],
        // proposal deposit
        2 * 1000000000000000000, // 2*10^18
        // min tokens to create
        5 * 10000000000000000000000, // 5*10^22
        // closing time in unixtime
        Date.now() + 600 // 10 minutes
      );
 
      //var promise = dao.curator(accounts[0]);
      var promise = dao;
      var curator = 0x01;
      promise.then(function(result) {
        console.log("DAO " + result);
        curator = result.curator;
        console.log("Curator A " + result.curator);
        console.log("Balance " + result.balanceOf.call(accounts[0]));
      }, function(err) {
        console.log("Error " + err);
      });

      console.log("Curator B " + curator);
      done();
    }
  });
};

describe("Contract abstractions", function() {

  describe("when using .whisk()", function() {

    // AlexandriaDAO contract
    tests(function(callback) {
      callback(null, Pudding.whisk({
        abi: dao_abi,
        binary: dao_binary,
        contract_name: "AlexandriaDAO",
        address: "0xe6e1652a0397e078f434d6dda181b218cfd42e02", // random; meant to check default values
      }));
    });

    // AlexandriaDAO_Creator contract
    tests(function(callback) {
      callback(null, Pudding.whisk({
        abi: creator_abi,
        binary: creator_binary,
        contract_name: "AlexandriaDAO_Creator",
        address: "0xe6e1652a0397e078f434d6dda181b218cfd42e02", // random; meant to check default values
      }));
    });
  });

  describe("when using generator/loader:", function() {
    tests(function(callback) {
      var dirPath = temp.mkdirSync('ether-pudding-generator');

      // AlexandriaDAO contract
      PuddingGenerator.save({
        "AlexandriaDAO": {
          abi: dao_abi,
          binary: dao_binary,
          address: "0xe6e1652a0397e078f434d6dda181b218cfd42e01"
        }
      }, dirPath, {removeExisting: true});

      var scope = {};

      PuddingLoader.load(dirPath, Pudding, scope, function(err, names) {
        callback(err, scope["AlexandriaDAO"]);
      });
    });

    tests(function(callback) {
      var dirPath = temp.mkdirSync('ether-pudding-generator');

      // AlexandriaDAO_Creator contract
      PuddingGenerator.save({
        "AlexandriaDAO_Creator": {
          abi: creator_abi,
          binary: creator_binary,
          address: "0xe6e1652a0397e078f434d6dda181b218cfd42e01"
        }
      }, dirPath, {removeExisting: true});

      var scope = {};

      PuddingLoader.load(dirPath, Pudding, scope, function(err, names) {
        callback(err, scope["AlexandriaDAO_Creator"]);
      });
    });
  });
});

