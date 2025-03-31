module.exports = (asyncFunc) => (req, res, next) => {
    Promise.resolve(asyncFunc(req, res, next)).catch((err) => {
        console.error("Async Error:", err.message); // Logs error for debugging
        next(err);
    });
};
