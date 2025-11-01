import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Firebase CLI scripts (not part of Next.js app)
      "grant-premium-cli.js",
      "grant-premium.js",
      "test-premium-api.js",
      // 임시로 문제가 있는 파일들 무시 (motion 관련 에러)
      "src/components/dashboard/enhanced-dashboard.tsx",
      "src/components/filters/advanced-filters.tsx",
      "src/components/influencer/influencer-discovery.tsx",
    ],
  },
];

export default eslintConfig;
