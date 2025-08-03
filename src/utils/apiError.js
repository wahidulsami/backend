class ApiError extends Error  {
    constructor(
        statusCode,
        message = "An error occurred",
        error = [] ,
        statck = ""
        
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.message = message;
        this.error = error;
        this.stack = statck;


        if(statck){
            this.stack = statck;
        } else{
            Error.captureStackTrace(this,  this.constructor);
        }
    }
}


export default ApiError;