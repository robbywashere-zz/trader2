module.exports = ({
  head = '',
  title = 'extra',
  body = Body(),
  navbar
}) => require('./base')({
  title,
  head,
  body,
  navbar
});

function Body() {
  return /*html*/ `
    <div class="extra">Extra Body</div>
  `
}