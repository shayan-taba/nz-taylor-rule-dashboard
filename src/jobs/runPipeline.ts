// Run with: npm run pipeline
import "dotenv/config";
import { runFullPipeline } from "../lib/pipeline";

runFullPipeline()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
