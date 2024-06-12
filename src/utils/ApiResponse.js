// This file is the common file to handle ApiResponse from the server. This file will be used to send the response from the server to the client.

// The ApiResponse class is a simple class that will be used to send the response from the server to the client. It will have the following properties:

// statusCode: The status code of the response (e.g., 200, 404, 500)

// data: The data that will be sent in the response. It can be an object, array, or any other data type that needs to be sent in the response (e.g., user data, post data, etc.)

// message: The message that will be sent in the response

class ApiResponse {
    constructor (  statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // If status code is less than 400 then it is a success response
    }
}

export { ApiResponse }