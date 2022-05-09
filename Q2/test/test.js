const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("HelloWorld", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    // Generate a proof for inputs 1 and 2
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    console.log("1x2 =", publicSignals[0]); // Prints the multiplication result to stdout

    const editedPublicSignals = unstringifyBigInts(publicSignals); // convert JS BigInts
    const editedProof = unstringifyBigInts(proof); // convert JS BigInts
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    ); // create the call data to be passed to solidity

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString()); // string parsing

    const a = [argv[0], argv[1]]; // data parsing
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ]; // data parsing
    const c = [argv[6], argv[7]]; // data parsing
    const Input = argv.slice(8); // data parsing

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // call the verify function with a correct proof (1*2=2)
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    // Generate a proof for inputs 1 and 2
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2", c: "1" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    console.log("1x2x1 =", publicSignals[0]); // Prints the multiplication result to stdout

    const editedPublicSignals = unstringifyBigInts(publicSignals); // convert JS BigInts
    const editedProof = unstringifyBigInts(proof); // convert JS BigInts
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    ); // create the call data to be passed to solidity

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString()); // string parsing

    const a = [argv[0], argv[1]]; // data parsing
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ]; // data parsing
    const c = [argv[6], argv[7]]; // data parsing
    const Input = argv.slice(8); // data parsing

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // call the verify function with a correct proof (1*2=2)
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe.only("Multiplier3 with PLONK", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("PlonkVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    // Generate a proof for inputs 1 and 2
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "1" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    console.log("1x2x1 =", publicSignals[0]); // Prints the multiplication result to stdout

    const editedPublicSignals = unstringifyBigInts(publicSignals); // convert JS BigInts
    const editedProof = unstringifyBigInts(proof); // convert JS BigInts
    const calldata = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    ); // create the call data to be passed to solidity

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString()); // string parsing

    const a = [argv[0], argv[1]]; // data parsing
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ]; // data parsing
    const c = [argv[6], argv[7]]; // data parsing
    const Input = argv.slice(8); // data parsing

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // call the verify function with a correct proof (1*2=2)
  });
  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
  });
});
