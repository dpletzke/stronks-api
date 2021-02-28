const io = require("socket.io-client");
const assert = require("chai").assert;

describe("live stock subscribing", () => {
  let clientSocket;

  before((done) => {
      clientSocket = io(`http://localhost:3000`);
      console.log(clientSocket)
      clientSocket.on("connect", done);
  });

  after(() => {
    clientSocket.close();
  });

  it("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      assert.equal(arg, "world");
      done();
    });
  });

  it("should work (with ack)", (done) => {
    clientSocket.emit("hi", (arg) => {
      assert.equal(arg, "hola");
      done();
    });
  });
});
