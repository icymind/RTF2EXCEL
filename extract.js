const fs = require("fs")
// 对一行字符串进行操作, 返回一个对象
// 对象: {
// season:"some",
// ...,
// "nonconformity details": [
//  title: "workshop",
//  qty: [0,0,0,0,0,0]
// ],
// "disposition": [
//  title: "sfsfs",
//  qty: "12"
// ]
// }

const nonconformityType = [
  "critical",
  "fabric",
  "hangtag",
  "label",
  "measurement",
  "packaging",
  "packing",
  "trim/findings",
  "vendor spec deviation",
  "workmanship",
  "rei spec inaccuracy"
]

function classify(nonconformityTitle) {

  let type = nonconformityTitle.split("-")[1]
  if (!nonconformityType.includes(type.toLowerCase())) {
    throw new Error(`unkown nonconformity type. nonconformityTitle: ${nonconformityTitle}, type: ${type}`)
  }
  return type
}

function extractFromFile(file) {
  let rtf
  if (fs.statSync(file).isFile()) {
    rtf = extract(fs.readFileSync(file))
    rtf["File Path"] = file
    if (rtf["parse error"]) {
      rtf["Parse Info"] = "Can not process the file"
    } else {
      rtf["Parse Info"] = "Parse sucess"
    }
  } else {
    rtf = {
      "parse error": true,
      "File Path": file,
      "Parse Info": "Can not read the file."
    }
  }
  return rtf
}

function extract(str) {
  // todo:一旦有某个开始不匹配, 则修改 error 属性
  let rtf = {"parse error": false}
  try {
    rtf["rei style number"] = getReiStyleNumber(str)
    rtf["audit level"] = getAuditLevel(str)
    rtf["auditor"] = getAuditor(str)
    rtf["season"] = getSeason(str)
    rtf["audit lot size"] = getAuditLotSize(str)
    rtf["audit quality level"] = getAuditQualityLevel(str)
    rtf["audit reject quantity"] = getAuditRejectQuantity(str)
    rtf["audit sample quantity"] = getAuditSampleQuantity(str)
    rtf["disposition"] = getDisposition(str)
    rtf["factory"] = getFactory(str)
    rtf["ga product number"] = getGAProductNumber(str)
    rtf["nonconformity details"] = getNonconformityDetails(str)
    rtf["po number"] = getPONumber(str)
    rtf["product name"] = getProductName(str)
    rtf["production status"] = getProductionStatus(str)
    rtf["vendor"] = getVendor(str)
    rtf["department"] = getDepartment(str)
  } catch(err) {
    console.log(err)
    return {"parse error": true}
  }
  return rtf
}

function getReiStyleNumber(str) {
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
        throw new Error(`unkown nonconformity type: ${type}`)
      }
      detailsArray.push({
        "title": specStr[1],
        "type": classify(specStr[1]),
        "qty": {
          "minor": specStr[3],
          "major": specStr[4],
          "critical": specStr[5],
          "rsi": specStr[6]
        }
      })
    } else {
      //当前只有一个字段, 没有匹配到后面的 qty. 说明这个字段是上一个类别 title 的延续
      if (detailsArray.length !== 0) {
        detailsArray[detailsArray.length - 1].title += specStr[1]
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
function getDisposition(str) {
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
        "title": item[1],
        "qty": item[3]
      })
    } else {
      dispositionArray[dispositionArray.length - 1].title += item[1]
    }
    item = reg.exec(tempStr)
  }
  return dispositionArray
}
function getDepartment(str) {
  let reg = /Department[^ ]+ ([^\\\{\}]+)/gmi
  return reg.exec(str)[1]
}

module.exports = {extract: extract, extractFromFile: extractFromFile, nonconformityType: nonconformityType}
