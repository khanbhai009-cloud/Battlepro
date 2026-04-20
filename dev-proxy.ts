import { spawn } from "child_process";

// Filter out --host and its value if it follows
const args = process.argv.slice(2);
const filteredArgs: string[] = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--host") {
    // Skip this and the next element (the IP/host value)
    i++;
    continue;
  }
  filteredArgs.push(args[i]);
}

// Always ensure we have -p 3000 and -H 0.0.0.0
// but let filteredArgs override if they exist
const finalArgs = ["next", "dev", "-p", "3000", "-H", "0.0.0.0", ...filteredArgs];

console.log("Starting Next.js with:", finalArgs.join(" "));

const devServer = spawn("npx", finalArgs, {
  stdio: "inherit",
  shell: true,
});

devServer.on("exit", (code) => {
  process.exit(code || 0);
});
