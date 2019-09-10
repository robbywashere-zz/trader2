const {
  formTextInput
} = require("../helpers/formTextInput");

module.exports = ({
  flash = null,
  errors = []
}) => {
  return /*html*/ `
  <div class="columns">
    <div class="column is-half">
      <div class="column is-half">
        <form action="/login" method="post">
          <label class="label">email</label>
          ${formTextInput({ 
            name: "email",
            placeholder: "email",
            errors,
          })}
          <label class="label">password</label>
          ${formTextInput({ 
            name: "password",
            placeholder: "password",
            type: "password",
            errors
          })}
          <div class="field is-grouped">
            <div class="control">
              <input type="submit" value="login" class="button is-link" />
            </div>
          </div>
          ${flash?`<pre>${flash}</pre>`:''}
        </form>
      </div>
    </div>
  </div>`;
}