export const NexosSecurity = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "read") return;

      const filePath = String(
        output.args?.filePath ?? ""
      )
        .replaceAll("\\", "/")
        .toLowerCase();

      const fileName = filePath.split("/").pop() ?? "";

      if (/^\.env(?:\..+)?$/.test(fileName)) {
        throw new Error(
          "NEXOS SECURITY: leitura de arquivo .env bloqueada."
        );
      }
    },
  };
};
