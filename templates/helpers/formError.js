function formError(name, message, value = "") {
  return {
    name,
    message,
    value
  };
}
exports.formError = formError;