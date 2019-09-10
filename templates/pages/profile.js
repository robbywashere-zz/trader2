const {
  formTextInput
} = require("../helpers/formTextInput");

module.exports = ({
  email = "",
  flash = null,
  errors = []
}) => {
  return /*html*/ `
  <div class="columns">
    <div class="column is-half">
      <form action="/profile" method="post">
        <label class="label">current email</label>
        <p style="margin-bottom:20px">${email}</p>
        <label class="label">email</label>
        ${formTextInput({ 
          name: "email",
          placeholder: "email",
          errors,
        })}
        <label class="label">confirm-email</label>
        ${formTextInput({ 
          name: "confirmEmail",
          placeholder: "confirm email",
        })}
        <hr/>
        <label class="label">password</label>
        ${formTextInput({ 
          name: "password",
          placeholder: "password",
          errors,
        })}
        <label class="label">confirm-password</label>
        ${formTextInput({ 
          name: "confirmPassword",
          placeholder: "confirm password",
        })}
        <div class="field is-grouped">
          <div class="control">
            <input type="submit" value="save" class="button is-link" />
            <a href="/config" class="button">cancel</a>
          </div>
        </div>
        ${flash?`<pre>${flash}</pre>`:''}
      </form>
    </div>
  </div>`;
}