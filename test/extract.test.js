const {expect} = require("chai")
const fs = require("fs")
const path = require("path")
const {extractFromFile} = require(path.join(__dirname, "../extract.js"))
const {file2rtfs} = require(path.join(__dirname, "./file2rtfs.js"))


describe("All test files must be exist", function(){

  it("test file must exist.", function() {
    let promises = []

    file2rtfs.forEach(function(file2rtf) {
      let promise = new Promise(function(resolve, reject) {
        fs.stat(path.join(__dirname, file2rtf.file), function(err, stat) {
          if (err) {
            reject()
          }
          resolve(expect(stat.isFile()).to.be.true)
        })
      })
      promises.push(promise)
    })

    return Promise.all(promises)
  })

})

describe("Test Method: extractFromFile.", function() {

  file2rtfs.forEach(function(file2rtf, index) {
    if (index === 0 || index === 2) { return }
    let rtf = extractFromFile(path.join(__dirname, file2rtf.file))
    it(`extractFromFile(${file2rtf.file}) should get true result.`, function() {
      expect(rtf).to.be.deep.equal(file2rtf.rtf)
    })
  })

})
