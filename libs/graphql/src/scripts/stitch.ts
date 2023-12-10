import { join } from "path";

function stitchSchemas() {
  // Read all the schemas from the schemas folder
  const schemasFolder = join(process.cwd(), 'generated');
  makeExecutableSchema({
  // Stitch them together
  // Write the stitched schema to the generated folder
}

stitchSchemas();
