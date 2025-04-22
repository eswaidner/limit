/** @type {import('vite').UserConfig} */
export default {
  build: {
    lib: {
      entry: ["src/limit.ts"],
      formats: ["es"],
      fileName: "limit",
    },
  },
};
