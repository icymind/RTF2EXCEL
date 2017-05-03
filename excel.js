const assert = require("assert")
const path = require("path")
const {nonconformityType} = require(path.join(__dirname, "extract.js"))
const Excel = require("exceljs")

function getNonconformityId(type) {
  assert.equal(type, type.toLowerCase(), "type must by lowercase")
  let ids = []
  let qtyTypes = ["minor", "major", "critical", "rsi"]
  qtyTypes.forEach(qtyType => {
    let id = `${type.split(" ").join("")}${qtyType}`.toLowerCase()
    ids.push({
      qtyType: qtyType,
      id: id
    })
  })
  return ids
}
function getFileds() {
  let fileds = [
    "File Path",
    "Parse Error",
    "Parse Info",
    "Season",
    "Vendor",
    "Factory",
    "PO Number",
    "Production Status",
    "GA Product Number",
    "Product Name",
    "REI Style Number",
    "Audit Lot Size",
    "Audit Quality Level",
    "Audit Sample Quantity",
    "Audit Reject Quantity",
    "Disposition"
  ]
  let nonconformityQtyType = ["minor", "major", "critical", "rsi"]
  nonconformityType.forEach(type => {
    nonconformityQtyType.forEach(qtyType => {
      fileds.push(`${type} ${qtyType}`)
    })
  })
  fileds.push("Auditor")
  return fileds
}

function createWorkbook(sheetName) {

  let fileds = getFileds()
  let sheetHeaders = []
  fileds.forEach(filed => {
    sheetHeaders.push({
      header: filed,
      key: filed.toLowerCase().split(" ").join("")
    })
  })
  // console.log(sheetHeaders)
  let workbook = new Excel.Workbook()
  let sheet = workbook.addWorksheet(sheetName)
  sheet.columns = sheetHeaders
  return workbook
}

function writeToWorkbook(workbook, sheetName, rtf) {
  if (!rtf) {
    console.log("you must save something")
    return
  }
  let row = {}
  let hasSeenType = new Set()
  for (let filed in rtf) {
    if (filed.toLowerCase() === "nonconformity details") {
      rtf[filed].forEach(detail => {
        let type = detail.type.toLowerCase()
        if (hasSeenType.has(type)) {
          getNonconformityId(type).forEach(item => {
            row[item.id] = parseInt(detail.qty[item.qtyType]) + parseInt(row[item.id])
          })
        } else {
          hasSeenType.add(type)
          getNonconformityId(type).forEach(item => {
            row[item.id] = parseInt(detail.qty[item.qtyType])
          })
        }
      })

    } else if (filed.toLowerCase() === "disposition") {
      let dispositionTitles = []
      rtf[filed].forEach(detail => dispositionTitles.push(detail.title))
      row[filed.toLowerCase()] = dispositionTitles.join("; ")
    } else {
      row[filed.toLowerCase().split(" ").join("")] = rtf[filed]
    }
  }
  // console.log(row)
  workbook.getWorksheet(sheetName).addRow(row)
}

module.exports = {
  writeToWorkbook: writeToWorkbook,
  createWorkbook: createWorkbook
}
