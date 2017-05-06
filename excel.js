const assert = require("assert")
const path = require("path")
const {nonconformityType} = require(path.join(__dirname, "extract.js"))
const Excel = require("exceljs")

function getNonconformityId(type) {
  let ids = []
  let qtyTypes = ["Minor", "Major", "Critical", "RSI"]
  qtyTypes.forEach(qtyType => {
    let id = `${type} ${qtyType}`
    ids.push({
      qtyType: qtyType,
      id: id
    })
  })
  return ids
}
function fillNonconformityQTY(row) {
  let nonconformityQtyType = ["Minor", "Major", "Critical", "RSI"]
  nonconformityType.forEach(type => {
    nonconformityQtyType.forEach(qtyType => {
      row[`${type} ${qtyType}`] = 0
    })
  })
}
function getFileds() {
  let fileds = [
    "File Path",
    "Parse Error",
    // "Parse Info",
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
    "Product Disposition Details"
  ]
  let nonconformityQtyType = ["Minor", "Major", "Critical", "RSI"]
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
      key: filed
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

  // fill Nonconformity Details QTY with 0
  fillNonconformityQTY(row)

  for (let field in rtf) {
    if (field === "Nonconformity Details" && Array.isArray(rtf[field])) {
      rtf[field].forEach(detail => {
        let type = detail["NonconformityType"]
        if (hasSeenType.has(type)) {
          getNonconformityId(type).forEach(item => {
            row[item.id] = parseInt(detail.QTY[item.qtyType]) + parseInt(row[item.id])
          })
        } else {
          hasSeenType.add(type)
          getNonconformityId(type).forEach(item => {
            row[item.id] = parseInt(detail.QTY[item.qtyType])
          })
        }
      })
    } else if (field === "Product Disposition Details" && Array.isArray(rtf[field])) {
      let dispositionTitles = []
      rtf[field].forEach(detail => dispositionTitles.push(detail["Disposition"]))
      row[field] = dispositionTitles.join("; ")
    } else {
      row[field] = rtf[field]
    }
  }
  // console.log(row)
  workbook.getWorksheet(sheetName).addRow(row)
}

module.exports = {
  writeToWorkbook: writeToWorkbook,
  createWorkbook: createWorkbook
}
