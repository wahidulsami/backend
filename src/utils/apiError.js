class ApiError extends Error  {
    constructor(
        statusCode,
        message = "An error occurred",
        error = [] ,
        stack = ""   
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.message = message;
        this.error = error;
        this.stack = stack;

        if(stack){
            this.stack = stack;
        } else{
            Error.captureStackTrace(this,  this.constructor);
        }
    }
}

export { ApiError };
