const fs = require("fs")
const assert = require("assert")
const nonconformityType = [
  "Critical",
  "Fabric",
  "Hangtag",
  "Label",
  "Measurement",
  "Packaging",
  "Packing",
  "Trim/Findings",
  "Vendor Spec Deviation",
  "Workmanship",
  "REI Spec Inaccuracy"
]
const rtfFields = {
  "Audit ID": getAuditID,
  "Audit Date": getAuditDate,
  "Department": getDepartment,
  "REI Style Number": getREIStyleNumber,
  "Audit Level": getAuditLevel,
  "Auditor": getAuditor,
  "Season": getSeason,
  "Product Name": getProductName,
  "Audit Quality Level": getAuditQualityLevel,
  "Audit Type": getAuditType,
  "Vendor": getVendor,
  "GA Product Number": getGAProductNumber,
  "Audit Lot Size": getAuditLotSize,
  "Production Status": getProductionStatus,
  "Factory": getFactory,
  "Product Spec": getProductSpec,
  "Audit Sample Quantity": getAuditSampleQuantity,
  "PO Number": getPONumber,
  "Product Lifecycle": getProductLifecycle,
  "Audit Reject Quantity": getAuditRejectQuantity,
  "Nonconformity Details": getNonconformityDetails,
  "Product Disposition Details": getProductDispositionDetails
}

const controlCommand = String.raw`(?:\{|\}|\r|\n|\t|(?:\\\n)|(?:\\[a-z]+\d* ?)|(?:\{\\\*\\[a-z]+ .+?\}))`
const plainText = String.raw`[^\{\}\n\r\\]+`
// const plainText = String.raw`.+`
const plainTextChars = String.raw`[^\{\}\n\r\\]`

function classify(nonconformityTitle) {

  let classifyError = new Error(`unkown nonconformity type. nonconformityTitle: ${nonconformityTitle}`)
  classifyError.name = "classifyError"

  try {
    let type = nonconformityTitle.split("-")[1]
    type = type.toLowerCase()
    for (let i = 0, len = nonconformityType.length; i < len; i++){
      if (nonconformityType[i].toLowerCase() === type) {
        return nonconformityType[i]
      }
    }
  } catch(error) {
    throw classifyError
  }

}

function extractFromFile(file) {
  let rtf = {}
  if (fs.statSync(file).isFile()) {
    rtf = extract(fs.readFileSync(file))
  } else {
    rtf["Parse Error"] = "Can not read the file."
  }
  rtf["File Path"] = file
  return rtf
}

function extract(str) {
  // todo:一旦有某个开始不匹配, 则修改 error 属性
  let rtf = {"Parse Error": ""}
  let errorMsg = []
  for (let field in rtfFields) {
    try {
      rtf[field] = rtfFields[field](str)
    } catch(err) {
      rtf[field] = ""
      errorMsg.push(field)
    }
  }
  if (errorMsg.length !== 0) {
    rtf["Parse Error"] = `Can not extract info: [ ${errorMsg.join("; ")} ]`
  }
  return rtf
}

function beautyLog(title, data) {
  console.log(`============${title} begin============`)
  console.log(data)
  console.log("======================================")
}

function extractSpansBetween(str, pre, post) {
  let pattern = `${pre}([\\s\\S]*?)${post}`
  let reg = new RegExp(pattern, "m")
  let matchParagraph = reg.exec(str)
  assert.equal(matchParagraph !== null, true)
  let paragraph = matchParagraph[1]

  let spans = []
  pattern = `${controlCommand}*\\b(${plainText})`
  reg = new RegExp(pattern, "gmi")
  let span = reg.exec(paragraph)
  while (span) {
    if (span[1].trimLeft() !== "") {
      spans.push(span[1].trimLeft())
    }
    span = reg.exec(paragraph)
  }
  if (spans[0].trim() === ":") {
    spans = spans.slice(1)
  }
  if (/^ *: .+$/.test(spans[0])) {
    spans[0] = /^ *: (.+)$/.exec(spans[0])[1]
  }
  // if (spans[spans.length - 1] === " ") {
    // spans =spans.slice(0, spans.length - 1)
  // }
  return spans
}

function getAndValidateSpan(str, fieldName, postFieldName, pattern, log=false) {
  let multiLine = ["Audit Quality Level", "Audit Lot Size", "Audit Sample Quantity"]
  let spans = extractSpansBetween(str, fieldName, postFieldName)
  if (log) {
    beautyLog(fieldName, spans)
  }
  if ((spans.length === 1 || multiLine.includes(fieldName)) && pattern.test(spans[0])) {
    return spans[0]
  } else {
    throw new Error(`Can not extract ${fieldName}`)
  }
}

function getNonconformityDetails(str) {
  let pattern = String.raw`Nonconformity Details[\s\S]+?_{8,}([\s\S]+?)Nonconformity Summary`
  let reg = new RegExp(pattern, "mi")
  let matchParagraph = reg.exec(str)
  assert.equal(matchParagraph !== null, true)
  let paragraph = matchParagraph[1]

  let spansPattern = `(${controlCommand}+)( *${plainText} *)(${controlCommand}+\\s(\\d+)${controlCommand}+\\s(\\d+)${controlCommand}+\\s(\\d+)${controlCommand}+\\s(\\d+)${controlCommand}+\\s(?:\\d+)${controlCommand}+\\s(?:\\d+)${controlCommand}+\\s(?:\\d+))?`

  reg = new RegExp(spansPattern, "gmi")

  let detailsArray = []
  let matchSpans = reg.exec(paragraph)
  while (matchSpans) {
    let controlCommandGroup = matchSpans[1]
    let firstPlainText = matchSpans[2]
    let qtyGroup = matchSpans[3]
    if (qtyGroup) {
      let [nonconformity, minorQTY, majorQTY, CriticalQTY, RSIQTY]  = [
        matchSpans[2],
        matchSpans[4],
        matchSpans[5],
        matchSpans[6],
        matchSpans[7],
      ]
      let type = classify(nonconformity)
      let detail = {
        "Nonconformity": nonconformity,
        "NonconformityType": type,
        "QTY": {
          "Minor": minorQTY,
          "Major": majorQTY,
          "Critical": CriticalQTY,
          "RSI": RSIQTY
        }
      }
      detailsArray.push(detail)
    } else if (firstPlainText !== " " && detailsArray.length !== 0){
      if (controlCommandGroup.includes("tx120")) {
        detailsArray[detailsArray.length - 1]["Nonconformity"] += firstPlainText
      }
    }
    matchSpans = reg.exec(paragraph)
  }
  return detailsArray

}
function getProductDispositionDetails(str) {
  let paragraphPattern = String.raw`Product Disposition Details[\s\S]+?Quantity[\s\S]+?Comments[\s\S]+?(?:_{8,})?([\s\S]+?)(?:(?:Audit Done)|(?:\\\*\\themedata))`
  let reg = new RegExp(paragraphPattern, "mi")
  let matchParagraphs = reg.exec(str)

  assert.equal(matchParagraphs !== null, true)

  let paragraph = matchParagraphs[1]

  let linePattern = String.raw`\b([\s\S]*?)(?:(?:\\par\b)|(?:\\pard\b))`
  reg = new RegExp(linePattern, "gmi")
  let matchLines = reg.exec(paragraph)

  let dispositionArray = []
  let lineTabPosition = []
  while(matchLines) {
    let spanPattern = `(${controlCommand}+?)\\b(${plainText})`
    let spanReg = new RegExp(spanPattern, "gmi")

    let line = matchLines[1]
    let matchSpans = spanReg.exec(line)

    let fieldArray = []
    while(matchSpans) {
      let positions = matchSpans[1].match(/tx\d+/gmi)
      if (positions) {
        lineTabPosition = positions
      }
      if (matchSpans[2] !== " ") {
        fieldArray.push(matchSpans[2])
      }
      matchSpans = spanReg.exec(line)
    }
    let fieldArrayLength = fieldArray.length
    if (fieldArrayLength === 3) {
      assert.equal(parseInt(fieldArray[1]), fieldArray[1], "Quantity must be number")
      dispositionArray.push({
        "Disposition": fieldArray[0],
        "Quantity": fieldArray[1]
      })
    } else if (fieldArrayLength === 2) {
      assert.equal(lineTabPosition.includes("tx90"), true, "unkown file layout")
      if (lineTabPosition.includes("tx3960")) {
        dispositionArray.push({
          "Disposition": fieldArray[0],
          "Quantity": fieldArray[1]
        })
      } else {
        dispositionArray[dispositionArray.length - 1]["Disposition"] += fieldArray[0]
      }
    } else if (fieldArrayLength === 1 && dispositionArray.length !== 0 && !lineTabPosition.includes("tx4200")) {
      dispositionArray[dispositionArray.length - 1]["Disposition"] += fieldArray[0]
    }
    matchLines= reg.exec(paragraph)
  }

  return dispositionArray
}
function getAuditID(str) {
  let spans = extractSpansBetween(str, "AuditID\\/Date", "Department")
  let idPattern = /^\d+$/
  if (spans.length !== 0 && idPattern.test(spans[0])) {
    return spans[0]
  } else {
    throw new Error("Can not extract Audit ID")
  }
}
function getAuditDate(str) {
  let spans = extractSpansBetween(str, "AuditID\\/Date", "Department")
  let datePattern = /^((\d{1,2}\/\d{1,2}\/\d{1,4})|(\d{1,4}\/\d{1,2}\/\d{1,2}))$/
  // beautyLog("dates", spans)
  if (spans.length === 1 && datePattern.test(spans[0])) {
    return spans[0]
  } else if (spans.length >= 2) {
    if (datePattern.test(spans.slice(1).join(""))) { return spans.slice(1).join("") }
    if (datePattern.test(spans.join(""))) { return spans.join("") }
  } else {
    throw new Error("Can not extract Audit Date")
  }
}
function getAuditType(str) {
  return getAndValidateSpan(str, "Audit Type", "Vendor", /^\w+[\w ]*$/)
}
function getProductSpec(str) {
  return getAndValidateSpan(str, "Product Spec", "Audit Sample Quantity", /^v\d+$/i)
}
function getProductLifecycle(str) {
  return getAndValidateSpan(str, "Product Lifecycle", "Audit Reject Quantity", /^[\w \-]+/)
}
function getREIStyleNumber(str) {
  return getAndValidateSpan(str, "REI Style Number", "Audit Level", /^\d+$/)
}
function getAuditLevel(str) {
  return getAndValidateSpan(str, "Audit Level", "Auditor", /^\w+$/)
}
function getAuditor(str) {
  return getAndValidateSpan(str, "Auditor", "Season", /^.+$/)
}
function getSeason(str) {
  return getAndValidateSpan(str, "Season", "Product Name", /^\w+$/)
}
function getDepartment(str) {
  return getAndValidateSpan(str, "Department", "REI Style Number", /^[\S ]+$/)
}
function getAuditQualityLevel(str) {
  return getAndValidateSpan(str, "Audit Quality Level", "Audit Type", /^(\d+|(\d+\.\d+))$/)
}
function getGAProductNumber(str) {
  return getAndValidateSpan(str, "GA Product Number", "Audit Lot Size", /^[\w\-]+$/)
}
function getAuditLotSize(str) {
  return getAndValidateSpan(str, "Audit Lot Size", "Production Status", /^(\d+|(\d+\.\d+))$/)
}
function getProductionStatus(str) {
  return getAndValidateSpan(str, "Production Status", "(?:(?:Factory)|(?:Non-GA Vendor Name))", /^[\w \-]+$/)
}
function getAuditSampleQuantity(str) {
  return getAndValidateSpan(str, "Audit Sample Quantity", "PO Number", /^\d+$/)
}
function getPONumber(str) {
  return getAndValidateSpan(str, "PO Number", "(?:(?:Product Lifecycle)|(?:Non-GA Vendor Number))", /\d+/, true)
}
function getAuditRejectQuantity(str) {
  return getAndValidateSpan(str, "Audit Reject Quantity", "Nonconformity Details", /^\d+$/)
}
function getProductName(str) {
  let productName = getAndValidateSpan(str, "Product Name", "Audit Quality Level", /^.*$/)
  let productNamePart = extractSpansBetween(str, "Audit Quality Level", "Audit Type")
  if (productNamePart.length !== 0) {
    productName += productNamePart.slice(1).join("")
  }
  return productName
}
function getVendor(str) {
  let vendor = getAndValidateSpan(str, "Vendor", "GA Product Number", /^\w.*$/)
  let vendorPart = extractSpansBetween(str, "Audit Lot Size", "Production Status")
  if (vendorPart.length !== 0) {
    vendor += vendorPart.slice(1).join("")
  }
  return vendor
}
function getFactory(str) {
  let factory = getAndValidateSpan(str, "Factory", "Product Spec", /^\w.*$/)
  let factoryPart = extractSpansBetween(str, "Audit Sample Quantity", "PO Number")
  if (factoryPart.length !== 0) {
    factory += factoryPart.slice(1).join("")
  }
  return factory
}

module.exports = {extract: extract, extractFromFile: extractFromFile, nonconformityType: nonconformityType}
