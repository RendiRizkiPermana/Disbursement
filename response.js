const response = (statusCode, data, message, res) => {
    res.json(statusCode, [
      {
        code: statusCode,
        payload: data,
        message,
        metadata: {
            prev: "", 
            next: "", 
            current: "",
        },
    }
    ])
}

module.exports = response