// This is the function for handling all the async functions in the application

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            return res.status(500).json({ message: 'An unexpected error occurred' });
        })
    }
}
export default asyncHandler