# MacOS

## Code Signing (Self Signed)

Create a self-signed code signing certificate (with any name) to enable "active app" feature:

- Launch Keychain Access
- Open `login` -> All Items tab
- In menu choose: Keychain Access -> Certificate Assistant -> Create a Certificate...
- Options: "WorkLogIfy Certificate", "Self-Signed Root", "Code Signing"
- Create, Continue

Then:

- Open the created certificate
- In "Trust" section change all options to "Always Trust".

Certificate will be found automatically when application is built.

## Local Installation

To install App locally, copy `WorkLogIfy.app` directory to `/Applications` directory.

Sign the app when it is in the `/Applications` directory:

```
codesign --force --deep --sign "WorkLogIfy Certificate" "/Applications/WorkLogIfy.app"
```
