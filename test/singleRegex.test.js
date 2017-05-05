const path = require("path")
const fs = require("fs")
const rewire = require("rewire")
const extractModule = rewire(path.join(__dirname, "../extract.js"))
// const {extract, extractFromFile} = require(path.join(__dirname, "../extract.js"))
const {expect} = require("chai")
const {file2rtfs} = require(path.join(__dirname, "./file2rtfs.js"))

describe("Test Method: getREIStyleNumber(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect REIStyleNumber works well in ${file2rtf.file}`, function() {
      const getREIStyleNumber = extractModule.__get__("getREIStyleNumber")
      expect(getREIStyleNumber(str)).to.equal(file2rtf.rtf["REI Style Number"])
    })
  })
})


describe("Test Method: getAuditLevel(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditLevel(str) works well in ${file2rtf.file}`, function() {
      const getAuditLevel = extractModule.__get__("getAuditLevel")
      expect(getAuditLevel(str)).to.equal(file2rtf.rtf["Audit Level"])
    })
  })
})

describe("Test Method: getAuditor(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditor(str) works well in ${file2rtf.file}`, function() {
      const getAuditor = extractModule.__get__("getAuditor")
      expect(getAuditor(str)).to.equal(file2rtf.rtf["Auditor"])
    })
  })
})
describe("Test Method: getSeason(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getSeason(str) works well in ${file2rtf.file}`, function() {
      const getSeason = extractModule.__get__("getSeason")
      expect(getSeason(str)).to.equal(file2rtf.rtf["Season"])
    })
  })
})
describe("Test Method: getAuditQualityLevel(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditQualityLevel(str) works well in ${file2rtf.file}`, function() {
      const getAuditQualityLevel = extractModule.__get__("getAuditQualityLevel")
      expect(getAuditQualityLevel(str)).to.equal(file2rtf.rtf["Audit Quality Level"])
    })
  })
})
describe("Test Method: getGAProductNumber(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getGAProductNumber(str) works well in ${file2rtf.file}`, function() {
      const getGAProductNumber = extractModule.__get__("getGAProductNumber")
      expect(getGAProductNumber(str)).to.equal(file2rtf.rtf["GA Product Number"])
    })
  })
})
describe("Test Method: getAuditLotSize(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditLotSize(str) works well in ${file2rtf.file}`, function() {
      const getAuditLotSize = extractModule.__get__("getAuditLotSize")
      expect(getAuditLotSize(str)).to.equal(file2rtf.rtf["Audit Lot Size"])
    })
  })
})
describe("Test Method: getProductionStatus(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getProductionStatus(str) works well in ${file2rtf.file}`, function() {
      const getProductionStatus = extractModule.__get__("getProductionStatus")
      expect(getProductionStatus(str)).to.equal(file2rtf.rtf["Production Status"])
    })
  })
})
describe("Test Method: getAuditSampleQuantity(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditSampleQuantity(str) works well in ${file2rtf.file}`, function() {
      const getAuditSampleQuantity = extractModule.__get__("getAuditSampleQuantity")
      expect(getAuditSampleQuantity(str)).to.equal(file2rtf.rtf["Audit Sample Quantity"])
    })
  })
})
describe("Test Method: getPONumber(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getPONumber(str) works well in ${file2rtf.file}`, function() {
      const getPONumber = extractModule.__get__("getPONumber")
      expect(getPONumber(str)).to.equal(file2rtf.rtf["PO Number"])
    })
  })
})
describe("Test Method: getAuditRejectQuantity(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditRejectQuantity(str) works well in ${file2rtf.file}`, function() {
      const getAuditRejectQuantity = extractModule.__get__("getAuditRejectQuantity")
      expect(getAuditRejectQuantity(str)).to.equal(file2rtf.rtf["Audit Reject Quantity"])
    })
  })
})
describe("Test Method: getDepartment(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getDepartment(str) works well in ${file2rtf.file}`, function() {
      const getDepartment = extractModule.__get__("getDepartment")
      expect(getDepartment(str)).to.equal(file2rtf.rtf["Department"])
    })
  })
})
describe("Test Method: getAuditID(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditID(str) works well in ${file2rtf.file}`, function() {
      const getAuditID = extractModule.__get__("getAuditID")
      expect(getAuditID(str)).to.equal(file2rtf.rtf["Audit ID"])
    })
  })
})
describe("Test Method: getAuditType(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditType(str) works well in ${file2rtf.file}`, function() {
      const getAuditType = extractModule.__get__("getAuditType")
      expect(getAuditType(str)).to.equal(file2rtf.rtf["Audit Type"])
    })
  })
})
describe("Test Method: getProductSpec(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getProductSpec(str) works well in ${file2rtf.file}`, function() {
      const getProductSpec = extractModule.__get__("getProductSpec")
      expect(getProductSpec(str)).to.equal(file2rtf.rtf["Product Spec"])
    })
  })
})
describe("Test Method: getProductLifecycle(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getProductLifecycle(str) works well in ${file2rtf.file}`, function() {
      const getProductLifecycle = extractModule.__get__("getProductLifecycle")
      expect(getProductLifecycle(str)).to.equal(file2rtf.rtf["Product Lifecycle"])
    })
  })
})
describe("Test Method: getAuditDate(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getAuditDate(str) works well in ${file2rtf.file}`, function() {
      const getAuditDate = extractModule.__get__("getAuditDate")
      expect(getAuditDate(str)).to.equal(file2rtf.rtf["Audit Date"])
    })
  })
})
describe("Test Method: getProductName(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"], {encoding: "utf8"})
    it(`expect getProductName(str) works well in ${file2rtf.file}`, function() {
      const getProductName = extractModule.__get__("getProductName")
      expect(getProductName(str)).to.equal(file2rtf.rtf["Product Name"])
    })
  })
})
describe("Test Method: getVendor(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"], {encoding: "utf8"})
    it(`expect getVendor(str) works well in ${file2rtf.file}`, function() {
      const getVendor = extractModule.__get__("getVendor")
      expect(getVendor(str)).to.equal(file2rtf.rtf["Vendor"])
    })
  })
})
describe("Test Method: getFactory(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    let str = fs.readFileSync(file2rtf.rtf["File Path"], {encoding: "utf8"})
    it(`expect getFactory(str) works well in ${file2rtf.file}`, function() {
      const getFactory = extractModule.__get__("getFactory")
      expect(getFactory(str)).to.equal(file2rtf.rtf["Factory"])
    })
  })
})
describe("Test Method: getNonconformityDetails(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    // let str = fs.readFileSync(file2rtf.rtf["File Path"], {encoding: "utf8"})
    let str = fs.readFileSync(file2rtf.rtf["File Path"])
    it(`expect getNonconformityDetails(str) works well in ${file2rtf.file}`, function() {
      const getNoncomformityDetails = extractModule.__get__("getNonconformityDetails")
      expect(getNoncomformityDetails(str)).to.deep.equal(file2rtf.rtf["Nonconformity Details"])
    })
  })
})
describe("Test Method: getProductDispositionDetails(str).", function() {
  file2rtfs.forEach(function (file2rtf) {
    // if (!file2rtf.rtf["File Path"].includes("multi-line")) return
    let str = fs.readFileSync(file2rtf.rtf["File Path"], {encoding: "utf8"})
    it(`expect getProductDispositionDetails(str) works well in ${file2rtf.file}`, function() {
      const getNoncomformityDetails = extractModule.__get__("getProductDispositionDetails")
      expect(getNoncomformityDetails(str)).to.deep.equal(file2rtf.rtf["Product Disposition Details"])
    })
  })
})
