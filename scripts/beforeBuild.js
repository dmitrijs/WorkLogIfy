import { execSync } from "child_process";
import path from "path";

export default async function ({ platform, arch }) {
    if (platform.name !== "win") return;

    const cwd = path.resolve("node_modules/get-windows");
    execSync(
        `npx @mapbox/node-pre-gyp install --target_platform=win32 --target_arch=${arch} --fallback-to-build=false`,
        { cwd, stdio: "inherit" },
    );
}
