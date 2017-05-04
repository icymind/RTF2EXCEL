const fs = require("fs")
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
  // "AuditID": getAuditID,
  // "AuditDate": getAuditDate,
  "Department": getDepartment,
  "REI Style Number": getREIStyleNumber,
  "Audit Level": getAuditLevel,
  "Auditor": getAuditor,
  "Season": getSeason,
  "Product Name": getProductName,
  "Audit Quality Level": getAuditQualityLevel,
  // "Audit Type": getAuditType,
  "Vendor": getVendor,
  "GA Product Number": getGAProductNumber,
  "Audit Lot Size": getAuditLotSize,
  "Production Status": getProductionStatus,
  "Factory": getFactory,
  // "Product Spec": getProductSpec,
  "Audit Sample Quantity": getAuditSampleQuantity,
  "PO Number": getPONumber,
  // "Product Lifecycle": getProductLifecycle,
  "Audit Reject Quantity": getAuditRejectQuantity,
  "Nonconformity Details": getNonconformityDetails,
  "Product Disposition Details": getProductDispositionDetails
}

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
  let reg = /REI Style Number[^ ]+ ([^\\\{]+)/gmi
  return reg.exec(str)[1]
}
function getAuditLevel(str) {
  let reg = /Audit Level[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]
}
function getAuditor(str) {
  let reg = /Auditor[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]
}
function getSeason(str) {
  let reg = /Season[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]
}
function getProductName(str) {
  let reg = /Product Name[^ ]+ ([^\\{\}]+)/gmi
  let productName = reg.exec(str)[1]
  reg = /Audit Quality Level[^ ]+ \d+\.\d+[^ ]+ ([^\\\{]+)[^ ]+ Audit Type/gmi
  let productNamePart = reg.exec(str)
  if(productNamePart) {
    productName += productNamePart[1]
  }
  return productName

}
function getAuditQualityLevel(str) {
  let reg = /Audit Quality Level[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getVendor(str) {
  let reg = /Vendor[^ ]+ ([^\\{\}]+)/gmi
  let vendor = reg.exec(str)[1]
  reg = /Audit Lot Size[^ ]+ \d+[^ ]+ ([^\\\{]+)([^ ]+ ([^\\\{]+))?[^ ]+ Production Status/gmi
  let vendorPart = reg.exec(str)
  if (vendorPart) {
    vendor += vendorPart[1]
    if (vendorPart[3]) {
      vendor += vendorPart[3]
    }
  }
  return vendor

}
function getGAProductNumber(str) {
  let reg = /GA Product Number[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getAuditLotSize(str) {
  let reg = /Audit Lot Size[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getProductionStatus(str) {
  let reg = /Production Status[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getFactory(str) {
  let reg = /Factory[^ ]+ ([^\\{\}]+)/gmi
  let factory = reg.exec(str)[1]
  reg = /Sample Quantity[^ ]+ [0-9]+[^ ]+ ([^\{\\]+)([^ ]+ ([^\\\{]+))?[^ ]+ PO Number.*/gmi
  let factoryPart2 = reg.exec(str)
  if (factoryPart2){
    factory += factoryPart2[1]
    if (factoryPart2[3]) {
      factory += factoryPart2[3]
    }
  }
  return factory

}
function getAuditSampleQuantity(str) {
  let reg = /Audit Sample Quantity[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getPONumber(str) {
  let reg = /PO Number[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getAuditRejectQuantity(str) {
  let reg = /Audit Reject Quantity[^ ]+ ([^\\{\}]+)/gmi
  return reg.exec(str)[1]

}
function getNonconformityDetails(str) {
  let reg = / Major[^ ]+ Critical[^ ]+ RSI[^ ]+ Comments[^ ]+ _{8,}(.+) Nonconformity Summary/gmi
  let tempStr = reg.exec(str)[1]
  reg = /[^ ]+ ([^\}]+)/gmi
  // return itemReg.exec(detailsStr)[1]
  let detailsArray = []
  let item = reg.exec(tempStr)
  while (item) {
    // let specReg = /([^\{\\]+)[^ ]*/gmi
    // console.log("===========")
    let specReg = /([^\{\\]+)[^ ]*( ([0-9]+)[^ ]* ([0-9]+)[^ ]* ([0-9]+)[^ ]* ([0-9]+).*)?/gmi
    let specStr = specReg.exec(item[1])
    if (specStr[2] !== undefined) {
      let type
      try {
        type = classify(specStr[1])
      } catch(error) {
        let classifyError = new Error(`unkown nonconformity type: ${type}`)
        classifyError.name = "classifyError"
        throw classifyError
      }
      detailsArray.push({
        "Nonconformity": specStr[1],
        "NonconformityType": classify(specStr[1]),
        "QTY": {
          "Minor": specStr[3],
          "Major": specStr[4],
          "Critical": specStr[5],
          "RSI": specStr[6]
        }
      })
    } else {
      //当前只有一个字段, 没有匹配到后面的 qty. 说明这个字段是上一个类别 title 的延续
      if (detailsArray.length !== 0) {
        detailsArray[detailsArray.length - 1]["Nonconformity"] += specStr[1]
      } else {
        //如果数组长度为零, 说明它不是谁的延续.
        throw new Error("不规律的文件, 请手动处理")
      }
    }
    item = reg.exec(tempStr)
  }
  // console.log(detailsArray)
  return detailsArray

}
function getProductDispositionDetails(str) {
  // let reg = /.+Disposition[^ ]+ ([^\\{\}]+)/gmi
  let reg = /Disposition.+ Quantity.+ Comments.+ _{8,}(.*) Audit Done/gmi
  let tempStr = reg.exec(str)[1]
  // todo : 多行/Users/simon/Downloads/QC data/CampingGea_FAIL848478CampKitchen14562_19Apr16_225851.rtf
  // /Users/simon/Downloads/QC data/CampingGea_FAIL877258FlexliteChairup16948_29Aug16_203509.rtf
  // /Users/simon/Downloads/QC data/Childrensw_FAIL101229650DDownJacket-18587_19May16_210504.rtf
  reg = /\{[^ ]+\\b[^ ]+ ([^\\\{\}]+)([^ ]+\\b[^ ]+ ([0-9]+))?/gmi
  let dispositionArray = []
  let item = reg.exec(tempStr)
  while (item) {
    if (item[2]) {
      dispositionArray.push({
        "Disposition": item[1],
        "Quantity": item[3]
      })
    } else {
      dispositionArray[dispositionArray.length - 1]["Disposition"] += item[1]
    }
    item = reg.exec(tempStr)
  }
  return dispositionArray
}
function getDepartment(str) {
  let reg = /Department[^ ]+ ([^\\\{\}]+)/gmi
  return reg.exec(str)[1]
}
function getAuditID(str) {}
function getAuditDate(str) {}
function getAuditType(str) {}
function getProductSpec(str) {}
function getProductLifecycle(str) {}

module.exports = {extract: extract, extractFromFile: extractFromFile, nonconformityType: nonconformityType}
