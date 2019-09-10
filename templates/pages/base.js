module.exports = ({
    body = '',
    title = '',
    head = '',
    navbar = ''
  }) =>
  /*html*/
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${head}
  </head>
  <body>
    ${navbar}
    <div class="main">
      ${title?/*html*/`<h1 class="title">${title}</h1>`:''}
      ${body}
    </div>
  </body>
</html>`