module.exports = ({
  req,
  error
}) => /*html*/ `
<h2 class="subtitle">code ${error.code}</h2>
<div class="error-details">
  <div>
    <strong>Path: ${req.originalUrl}</strong>
  </div>
  <div>
    <strong>Message:</strong>
    <pre>
      ${(process.env.NODE_ENV === 'production' ? error.message : error.stack)}
    </pre>
  </div>
</div>`