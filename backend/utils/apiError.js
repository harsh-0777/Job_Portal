class apiError extends Error {
  constructor(statusCode, error = [], message = "Something Went Wrong") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    this.success = false;
  }
}

export default apiError;
