const {
  formTextInput
} = require('../helpers/formTextInput');
module.exports = ({
  config
}) => {
  return /*html*/ `
  <div class="columns">
    <div class="column is-half">
      ${ConfigForm(config)}
    </div>
  </div>`;

}

function ConfigForm({
  schedule,
  amount,
  enabled,
  apiKeys = [],
  selectedKey,
  debug,
  errors = {}
} = {}) {

  return /*html*/ `
  <form action="/config" id="config" method="post">

    <label class="label">amount</label>
    <div class="field">
      <div class="control">
        <input class="input" name="amount" value="${amount}" type="text" placeholder="$">
      </div>
    </div>
    <label class="label" for="schedule">schedule</label>
    <div class="field is-grouped">
      <p class="control is-expanded">
        <input autocomplete="off" onkeyup="evaluateSchedule()" class="input" id="schedule" name="schedule" value="${schedule}" type="text" placeholder="*****">
      </p>
    </div>
    <p>
      <pre id="evaluate"></pre>
    </p>
    <div class="field">
      <label class="label">api key</label>
      <div class="select">
        ${ApiKeyList(apiKeys,selectedKey)}
      </div>
    </div>
    <div class="field">
      <label class="label">enabled</label>
      <input type="checkbox" id="enabled" class="switch" name="enabled" ${enabled ? 'checked="checked"' : ''} />
      <label for="enabled" class="switch"></label>
    </div>
    <div class="field">
      <label class="label">debug mode</label>
      <input type="checkbox" id="debug" class="switch" name="debug" ${debug ? 'checked="checked"' : ''} />
      <label for="debug" class="switch"></label>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <input type="submit" value="save" class="button is-link" />
        <a href="/config" class="button">cancel</a>
      </div>
    </div>
  </form>
  `
}

function ApiKeyList(apiKeys = [], selectedKey) {
  return /*html*/ `
    <select name="selectedKey">
      ${apiKeys.map(k=>/*html*/`<option value="${k}" ${k==selectedKey?"selected":""}>${k}</option>`)}
    </select>`
}