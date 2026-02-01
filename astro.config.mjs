// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://moz-sec.com",
  base: "/note",
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid", "math"],
    },
  },
  integrations: [
    starlight({
      title: "moz-sec Note",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/moz-sec/note",
        },
        {
          icon: "twitter",
          label: "X",
          href: "https://x.com/moz_sec_",
        },
      ],
      sidebar: [
        {
          label: "Top",
          items: [
            { label: "このノートについて", slug: "about_this_note" },
            { label: "サーバー設定", slug: "server" },
            { label: "自作PC", slug: "maked_pc" },
            { label: "Git", slug: "git" },
            { label: "eBPF", slug: "ebpf" },
            {
              label: "コンテナ",
              autogenerate: { directory: "container" },
            },
            {
              label: "Kubernetes",
              autogenerate: { directory: "kubernetes" },
            },
            {
              label: "ネットワーク",
              autogenerate: { directory: "network" },
            },
            {
              label: "パフォーマンス",
              autogenerate: { directory: "performance" },
            },
            {
              label: "セキュリティ",
              autogenerate: { directory: "security" },
            },
          ],
        },
      ],
    }),
  ],
});
