//statusCode we are getting manually from input of function
//this is the custom function for creating the error
export const errorHandler = (statusCode, message) => {
  const error = new Error();// Error() is javascript error constructor to create an error.
  error.statusCode = statusCode;
  error.message = message;
  return error;
};
