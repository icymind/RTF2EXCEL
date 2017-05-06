const fields = [
  "File Path",
  "Parse Error",
  "Audit ID",
  "Audit Date",
  "Department",
  "REI Style Number",
  "Audit Level",
  "Auditor",
  "Season",
  "Product Name",
  "Audit Quality Level",
  "Audit Type",
  "Vendor",
  "GA Product Number",
  "Audit Lot Size",
  "Production Status",
  "Factory",
  "Product Spec",
  "Audit Sample Quantity",
  "PO Number",
  "Product Lifecycle",
  "Audit Reject Quantity",
  "Nonconformity Details",
  "Product Disposition Details",
]

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

module.exports = {nonconformityType: nonconformityType, fields: fields}
