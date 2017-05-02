require("chai").should()
const rewire = require("rewire")
const parseRTF = require("rtf-parser")
const fs = require("fs")
const task = rewire("../task.js")


describe("Collect Task", function() {
  this.timeout(5000)
  const normalSiglePath = "./test/normal-sigle.rtf"
  const normalMultiPath = "./test/normal-multi.rtf"
  const searchIndex = task.__get__("searchIndex")
  let normalSigle, normalMulti

  before(function() {
    const promise1 = new Promise((resolve, reject) => {
      parseRTF.stream(fs.createReadStream(normalSiglePath), (err, doc) => {
        normalSigle = doc
        resolve()
      })
    })
    const promise2 = new Promise((resolve, reject) => {
      parseRTF.stream(fs.createReadStream(normalMultiPath), (err, doc) => {
        normalMulti = doc
        resolve()
      })
    })
    return Promise.all([promise1, promise2])
  })

  after(function() {
    normalMulti = null
    normalSigle = null
  })

  describe("searchIndex(doc, name)", function() {
    it("should return {rowIndex: 10, colIndex: 0} for normalSigle.", function() {
      this.skip()
      const out = searchIndex(normalSigle, "nonconformity")
      searchIndex(normalSigle, "nonconformity").should.eql({rowIndex: 10, colIndex: 0})
    })
    it("should return {rowIndex: 10, colIndex: 0} for normalMulti.", function() {
      this.skip()
      const out = searchIndex(normalMulti, "nonconformity")
      searchIndex(normalSigle, "nonconformity").should.eql({rowIndex: 10, colIndex: 0})
    })
  })
})
