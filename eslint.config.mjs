import cds from "@sap/cds/eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";

export default [...cds.recommended, eslintConfigPrettier];
