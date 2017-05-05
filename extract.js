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
// const controlCommand = String.raw`(?:\{|\}|(?:\\\n)|(?:\\[a-z]+\d* ?))`
// const controlCommand = String.raw`(?:\{|\}|\r|\n|(?:\\\n)|(?:\\[a-z]+?\d*?\s*?))`
const plainText = String.raw`[^\{\}\n\r\\]+`
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
      errorMsg.push(field)
    }
  }
  if (errorMsg.length !== 0) {
    rtf["Parse Error"] = `Can not extract info: [ ${errorMsg.join("; ")} ]`
  }
  return rtf
}

function getREIStyleNumber(str) {
  let combine = `REI Style Number${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Audit Level`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]
  if (result === null || !/\d+/.test(result)) {
    throw new Error(`Can not extract info: REI Style Number: ${result}`)
  }
  return result
}
function getAuditLevel(str) {
  let combine = `Audit Level${controlCommand}+(?:: )?${controlCommand}+(${plainText})${controlCommand}+Auditor`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*(\d+)/.exec(result)
  if (cleanup) {
    result = cleanup[1]
  }
  if (result === null || !/\w+/.test(result)) {
    throw new Error()
  }
  return result
}
function getAuditor(str) {
  let combine = `Auditor${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Season`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]
  if (result === null || !/\w+/.test(result)) {
    throw new Error()
  }
  return reg.exec(str)[1]
}
function getSeason(str) {
  let combine = `Season${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Product Name`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*(\w+)/.exec(result)
  if (cleanup) {
    result = cleanup[1]
  }
  if (result === null || !/\w+/.test(result)) {
    throw new Error()
  }
  return result
}
function getProductName(str) {
  let combine = `Product Name${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Audit Quality Level`
  let reg = new RegExp(combine, "mi")
  let productName = reg.exec(str)[1]

  combine = `Audit Quality Level${controlCommand}+(?: : )?${controlCommand}+${plainText}([\\s\\S]*)Audit Type`
  reg = new RegExp(combine, "mi")
  let remainText = reg.exec(str)
  remainText = remainText[1]

  combine = `${controlCommand}+(${plainTextChars}*)`
  reg = new RegExp(combine, "gmi")
  let productNamePart = reg.exec(remainText)
  while (productNamePart) {
    productName += productNamePart[1]
    productNamePart = reg.exec(remainText)
  }
  return productName

}
function getAuditQualityLevel(str) {
  // todo: 添加 audit type 会出错
  let combine = `Audit Quality Level${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*([\d.]+)/.exec(result)
  if (cleanup) {
    result = cleanup[1]
  }
  if (result === null || !/[\d.]+/.test(result)) {
    throw new Error()
  }
  return result

}
function getVendor(str) {
  let combine = `Vendor${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+GA Product Number`
  let reg = new RegExp(combine, "mi")
  let vendor = reg.exec(str)[1]

  combine = `Audit Lot Size${controlCommand}+(?: : )?${controlCommand}+${plainText}([\\s\\S]*)Production Status`
  reg = new RegExp(combine, "mi")
  let remainText = reg.exec(str)
  remainText = remainText[1]

  combine = `${controlCommand}+(${plainTextChars}*)`
  reg = new RegExp(combine, "gmi")
  let vendorPart = reg.exec(remainText)
  while (vendorPart) {
    vendor += vendorPart[1]
    vendorPart = reg.exec(remainText)
  }
  return vendor

}
function getGAProductNumber(str) {
  let combine = `GA Product Number${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Audit Lot Size`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]

}
function getAuditLotSize(str) {
  // todo 末尾添加production status时,会出错
  let combine = `Audit Lot Size${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]

}
function getProductionStatus(str) {
  let combine = `Production Status${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Factory`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]

}
function getFactory(str) {
  let combine = `Factory${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Product Spec`
  let reg = new RegExp(combine, "mi")
  let factory = reg.exec(str)[1]

  combine = `Sample Quantity${controlCommand}+(?: : )?${controlCommand}+${plainText}([\\s\\S]*)PO Number`
  reg = new RegExp(combine, "mi")
  let remainText = reg.exec(str)
  remainText = remainText[1]

  combine = `${controlCommand}+(${plainTextChars}*)`
  reg = new RegExp(combine, "gmi")

  let factoryPart = reg.exec(remainText)
  while (factoryPart) {
    factory += factoryPart[1]
    factoryPart = reg.exec(remainText)
  }
  return factory
}
function getAuditSampleQuantity(str) {
  // todo
  let combine = `Audit Sample Quantity${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*(\d+)/.exec(result)
  if (cleanup) {
    result = cleanup[1]
  }
  if (result === null || !/\d+/.test(result)) {
    throw new Error("Can not extract info: REI Style Number")
  }

  return result

}
function getPONumber(str) {
  // let combine = `PO Number${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+Product Lifecycle`
  let combine = `PO Number${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]

}
function getAuditRejectQuantity(str) {
  // todo
  let combine = `Audit Reject Quantity${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")

  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*(\d+)/.exec(result)
  // console.log(cleanup)
  if (cleanup) {
    // console.log("cleanup")
    result = cleanup[1]
  }
  if (result === null || !/\d+/.test(result)) {
    throw new Error("Can not extract info: REI Style Number")
  }

  return result

}
function getNonconformityDetails(str) {
  let combine = `Comments${controlCommand}+_{8,}([\\s\\S]+)Nonconformity Summary`
  let reg = new RegExp(combine, "mi")
  let remainText = reg.exec(str)[1]

  // console.log(remainText)
  combine = `(${controlCommand}+)( *${plainText} *)(${controlCommand}+\\s(\\d+)${controlCommand}+\\s(\\d+)${controlCommand}+\\s(\\d+)${controlCommand}+\\s(\\d+)${controlCommand}+\\s(?:\\d+)${controlCommand}+\\s(?:\\d+)${controlCommand}+\\s(?:\\d+))?`

  // combine = `(${controlCommand}+)(${plainText})(${controlCommand}+(${plainText})${controlCommand}+(${plainText})${controlCommand}+(${plainText})${controlCommand}+(${plainText})${controlCommand}+(?:\\d+)${controlCommand}+(?:\\d+)${controlCommand}+(?:\\d+))?`
  reg = new RegExp(combine, "gmi")

  let detailsArray = []
  let item = reg.exec(remainText)
  while (item) {
    let controlCommandGroup = item[1]
    let firstPlainText = item[2]
    let qtyGroup = item[3]
    // console.log(item)
    if (qtyGroup) {
      let [nonconformity, minorQTY, majorQTY, CriticalQTY, RSIQTY]  = [
        item[2],
        item[4],
        item[5],
        item[6],
        item[7],
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
      // console.log(detail)
      detailsArray.push(detail)
    } else if (firstPlainText !== " " && detailsArray.length !== 0){
      if (controlCommandGroup.includes("tx120")) {
        detailsArray[detailsArray.length - 1]["Nonconformity"] += firstPlainText
        // console.log(`pre: #${detailsArray[detailsArray.length - 1]["Nonconformity"]}#`)
        // console.log(`current: #${firstPlainText}#`)
        // console.log(`command: #${firstPlainText}#`)
        // console.log(`command's attribute: #${controlCommandGroup}#`)
      }
    }
    item = reg.exec(remainText)
  }
  return detailsArray

}
function getProductDispositionDetails(str) {
  let combine = `Quantity${controlCommand}+Comments${controlCommand}+_{8,}([\\s\\S]+)Audit Done`
  let reg = new RegExp(combine, "mi")
  let remainText = reg.exec(str)[1]

  let linePattern = String.raw`\b([\s\S]*?)\\par\b`
  let lineReg = new RegExp(linePattern, "gmi")
  let lines = lineReg.exec(remainText)
  if (lines === null) {

    linePattern = String.raw`\b([\s\S]*?)\\pard\b`
    lineReg = new RegExp(linePattern, "gmi")
    lines = lineReg.exec(remainText)
    if (lines === null) {
      throw new Error("Can not Extract Product Disposition Details")
    }
  }

  let dispositionArray = []
  let lineTabPosition = []
  while(lines) {
    let fieldPattern = `(${controlCommand}+?)\\b(${plainText})`
    let fieldReg = new RegExp(fieldPattern, "gmi")

    let line = lines[1]
    let field = fieldReg.exec(line)

    let fieldArray = []
    while(field) {
      let positions = field[1].match(/tx\d+/gmi)
      if (positions) {
        lineTabPosition = positions
      }
      if (field[2] !== " ") {
        fieldArray.push(field[2])
      }
      field = fieldReg.exec(line)
    }
    // console.log("lineTabPosition", lineTabPosition)
    // console.log("fieldArray", fieldArray)
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
    } else if (fieldArrayLength === 1 && dispositionArray.length !==0 && !lineTabPosition.includes("tx4200")) {
      dispositionArray[dispositionArray.length - 1]["Disposition"] += fieldArray[0]
    }
    lines = lineReg.exec(remainText)
  }

  return dispositionArray
}
function getDepartment(str) {
  let combine = `Department${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]
}
function getAuditID(str) {
  let combine = `AuditID\\/Date${controlCommand}+(?: : )?${controlCommand}+(${plainText})${controlCommand}+(${plainText})${controlCommand}+Department`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*(\d+)/.exec(result)
  // console.log(cleanup)
  if (cleanup) {
    console.log("cleanup")
    result = cleanup[1]
  }
  if (result === null || !/\d+/.test(result)) {
    throw new Error("Can not extract info: REI Style Number")
  }

  if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(result)) {
    result = ""
  }

  return result
}
function getAuditDate(str) {
  let combine = `AuditID\\/Date${controlCommand}+(?: : )?${controlCommand}+${plainText}${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]

  let cleanup = /\s*:\s*([/\w]+)/.exec(result)
  if (cleanup) {
    // console.log("cleanup")
    result = cleanup[1]
  }
  console.log(result)
  if (result === null || !/\d{1,4}\/\d{1,4}\/\d{1,4}/.test(result)) {
    throw new Error("Can not extract info")
  }

  return result

}
function getAuditType(str) {
  let combine = `Audit Type${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]
}
function getProductSpec(str) {
  let combine = `Product Spec${controlCommand}+(?: : )?${controlCommand}+\\b(${plainText})${controlCommand}+Audit Sample Quantity`
  let reg = new RegExp(combine, "mi")
  let result = reg.exec(str)[1]
  return result
}
function getProductLifecycle(str) {
  let combine = `Product Lifecycle${controlCommand}+(?: : )?${controlCommand}+(${plainText})`
  let reg = new RegExp(combine, "mi")
  return reg.exec(str)[1]
}

module.exports = {extract: extract, extractFromFile: extractFromFile, nonconformityType: nonconformityType}
