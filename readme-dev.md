# MacOS

Create a self-signed code signing certificate (with any name) to enable "active app" feature:
- Launch Keychain Access
- Open `login` -> All Items tab
- In menu choose: Keychain Access -> Certificate Assistant -> Create a Certificate...
- Options: "Name Lastname", "Self-Signed Root", "Code Signing"
- Create, Continue

Then:
- Open the created certificate
- In "Trust" section change all options to "Always Trust".

Certificate will be found automatically when application is built.
