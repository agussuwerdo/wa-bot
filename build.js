const esbuild = require("esbuild");
const path = require("path");

const watch = process.argv.includes("--watch");

async function build() {
  const context = await esbuild.context({
    entryPoints: [path.resolve(__dirname, "frontend/src/App.tsx")],
    bundle: true,
    minify: !watch,
    sourcemap: watch,
    target: ["chrome58", "firefox57", "safari11"],
    outfile: "public/js/bundle.js",
    define: {
      "process.env.NODE_ENV": watch ? '"development"' : '"production"',
    },
    loader: {
      ".tsx": "tsx",
      ".ts": "ts",
    },
  });

  if (watch) {
    await context.watch();
    console.log('watching for changes...');
  } else {
    await context.rebuild();
    context.dispose();
  }
}

build().catch(() => process.exit(1));
