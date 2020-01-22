const { formTextInput } = require('../helpers/formTextInput');
module.exports = ({ config, runonce_flash }) => {
    return /*html*/ `
  <div class="columns">
    <div class="column is-half">
      ${ConfigForm(config)}
    </div>
  ${ConfigRunOnceFlash(runonce_flash)}
  </div>`;
};

function ConfigRunOnceFlash(body) {
    if (!body) return '';
    let parseBody;
    try {
        parseBody = typeof body === 'string' ? body : JSON.stringify(body, null, 4);
    } catch (e) {
        parseBody = body;
    }
    return /*html*/ `
<div class="column is-half">
  <pre>${body}</pre>
</div>`;
}

function ConfigForm({
    schedule,
    amount,
    enabled,
    hardDebug,
    apiKeys = [],
    ident,
    debug,
    errors = {},
} = {}) {
    return /*html*/ `
  <form action="/config" id="config" method="post">

    <label class="label">amount</label>
    <div class="field">
      <div class="control">
        <input class="input" name="amount" value="${amount}" type="text" placeholder="$">
      </div>
    </div>
    <div class="schedule">
      <label class="label" for="schedule">schedule</label>
      <div class="field is-grouped">
        <p class="control is-expanded">
          <input autocomplete="off" onkeyup="evaluateSchedule()" class="input" id="schedule" name="schedule" value="${schedule}" type="text" placeholder="*****">
        </p>
      </div>
      <p>
        <pre id="evaluate"></pre>
      </p>
    </div>
    <div class="field">
      <label class="label">run once</label>
      <input type="checkbox" id="runonce" class="switch" name="runonce"/>
      <label for="runonce" class="switch"></label>
    </div>
    <div class="field">
      <label class="label">api key</label>
      <div class="select">
        ${ApiKeyList(apiKeys, ident)}
      </div>
    </div>
    <div class="field">
      <label class="label">enabled</label>
      <input type="checkbox" id="enabled" class="switch" name="enabled" ${
          enabled ? 'checked="checked"' : ''
      } />
      <label for="enabled" class="switch"></label>
    </div>
    <div class="field">
      <label class="label">dev mode</label>
      <input type="checkbox" id="debug" class="switch" name="debug" ${
          debug ? 'checked="checked"' : ''
      } />
      <label for="debug" ${hardDebug ? `onclick="return false"` : ''} class="switch"></label>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <input type="submit" value="save" class="button is-link" />
        <a href="/config" class="button">cancel</a>
      </div>
    </div>
  </form>
  `;
}
// <br style="margin: 22px 0px"/>
// <form action="/rfc/runonce">
//   <input type="submit" value="runonce" class="button is-link" />
// </form>

function ApiKeyList(apiKeys = [], ident) {
    return /*html*/ `
    <select name="ident">
      ${apiKeys.map(
          k => /*html*/ `<option value="${k}" ${k == ident ? 'selected' : ''}>${k}</option>`,
      )}
    </select>`;
}
