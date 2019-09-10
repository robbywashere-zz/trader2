function formTextInput({
  name,
  placeholder = "",
  value = "",
  type = "text",
  error = null,
  errors,
  noAutoComplete = false
}) {
  if (errors) {
    error = errors.find(e => e.name === name);
    value = (errors.find(e => e.name === name) || {}).value || value;
  };
  return /*html*/ `
    <div class="field">
      <p class="control">
        <input 
          ${type === "password" || noAutoComplete ? `autocomplete="off"`:""} 
          class="input ${error ? 'is-danger' : ''}" 
          name="${name}" 
          type="${type}" 
          value="${value}" 
          placeholder="${placeholder}">
      </p>
      ${error ? /*html*/ `<p class="help is-danger">${error.message}</p>` : ''}
    </div>`;
}
exports.formTextInput = formTextInput;