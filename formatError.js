function FormatError(message) {
  this.message = message || "inregular file content format."
  this.name = "FormatError"
}

FormatError.prototype = new Error()
FormatError.prototype.constructor = FormatError

module.exports = FormatError
