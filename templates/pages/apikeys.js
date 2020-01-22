const { formTextInput } = require('../helpers/formTextInput');
const { Haiku } = require('../../lib/crypto');
module.exports = renderData => {
    return /*html*/ `
  <div class="columns">
    <div class="column is-half">
      ${APIKeysForm(renderData)}
    </div>
  </div>`;
};

function APIKeysForm({ flash, errors } = {}) {
    return /*html*/ `
  <form action="/apikeys" method="post" autocomplete="off">
    <label class="label">identifier</label>
    ${formTextInput({
        name: 'ident',
        value: Haiku(0),
        errors,
    })}
    <label class="label">apiKey</label>
    ${formTextInput({
        name: 'apiKey',
        errors,
    })}
    <label class="label">passphrase</label>
    ${formTextInput({
        name: 'passphrase',
        errors,
    })}
    <label class="label">secret</label>
    ${formTextInput({
        name: 'secret',
        errors,
    })}
    <div class="field is-grouped">
      <div class="control">
        <input type="submit" value="add" class="button is-link" />
        <a href="/apikeys" class="button">cancel</a>
      </div>
    </div>
    ${flash ? `<pre>${flash}</pre>` : ''}
  </form>
  `;
}
