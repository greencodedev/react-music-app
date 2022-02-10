const router = require("express").Router();
const path = require('path');
const fs = require('fs');
const htmlRoot = path.dirname(require.main.filename) + "/public/html"

router.get("/", (req, res) => {
    res.sendFile(path.join(htmlRoot + '/index.html'));
})

const otherPaths = {
    auth: ["login", "register"],
    account: ["profile"],
    policies: ["privacy", "tos", "termsofservice", "terms-of-service", "policies", "policy"],
    subscriptions: ["subscription"]

}

router.get("/:file", (req, res) => {
    // fetching favicon.ico??
    let file = req.params.file;
    // remove the .html
    if (file.includes(".")) file = file.slice(0, file.indexOf("."));
    // if wrong path, redirect
    //* write this as I did w/ the filter (DRY) 
    if (otherPaths.auth.includes(file)) file = "authentication";
    else if (otherPaths.account.includes(file)) file = "account";
    else if (otherPaths.policies.includes(file)) file = "privacy-policy-terms"
    else if (otherPaths.subscriptions.includes(file)) file = "subscriptions"

    const filePath = path.join(htmlRoot + `/${file}.html`);
    // console.log("FILE:", file, "EXISTS:", fs.existsSync(filePath)) //! testing
    if (fs.existsSync(filePath)) {
        if (file.includes(".html") || !file.includes(".ico")) res.sendFile(filePath);
    } else res.sendFile(path.join(htmlRoot + "/404.html"))
})

module.exports = router;
