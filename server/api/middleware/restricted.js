const {
  verify
} = require("jsonwebtoken")
const {
  getUserById
} = require("../../../database/model/userModel")

module.exports = (req, res, next) => {
  const {
    authorization
  } = req.headers;

  if (!authorization) return res.status(400).json({
    msg: "No authorization token provided"
  })

  verify(authorization, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({
        msg: "Invalid token"
      })
    }
    // req.decodedToken = decodedToken;
    const user_id = decodedToken.subject

    getUserById(user_id).then(async ([user]) => {
      if (!user) return res.status(403).json({
        msg: `The user ID: ${user_id} is not associated with any account.`
      })

      req.user = user
      next();
    })
  });
};
