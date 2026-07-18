// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  if (err.name === 'MulterError' || err.message?.startsWith('File type not allowed')) {
    statusCode = 400;
  }
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
