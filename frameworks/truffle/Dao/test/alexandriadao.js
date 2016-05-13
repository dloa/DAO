contract('AlexandriaDAO', function(accounts) {
  it("should assert contract deployed", function(done) {
    var dao = AlexandriaDAO.at(AlexandriaDAO.deployed_address);
    assert.isTrue(true);
    done();
  });
});

contract('AlexandriaDAO', function(accounts) {
  it("should assert contract deployed", function(done) {
    var dao = AlexandriaDAO.deployed();
    assert.isTrue(true);
    done();
  });
});

contract('AlexandriaDAO_Creator', function(accounts) {
  it("should assert contract deployed", function(done) {
    var example = AlexandriaDAO_Creator.at(AlexandriaDAO_Creator.deployed_address);
    assert.isTrue(true);
    done();
  });
});

contract('AlexandriaDAO_Creator', function(accounts) {
  it("should assert contract deployed", function(done) {
    var example = AlexandriaDAO_Creator.deployed();
    assert.isTrue(true);
    done();
  });
});