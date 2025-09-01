// Centralized mock data and helpers for DuckWire

export function getClusters() {
  return [
    {
      id: "c1",
      slug: "largest-flotilla-for-gaza",
      title: "Largest flotilla for Gaza hopes to pressure Israel to end blockade",
      summary: [
        "Over 50 ships from 44 nations will attempt to deliver aid",
        "Mission aims to challenge 15-year naval blockade",
        "Participants include hundreds of activists",
      ],
      coverage: { left: 9, center: 12, right: 4, total: 29 },
      sourceCount: 29,
      sources: [
        { id: "s1", outlet: "Reuters", bias: "center", hoursAgo: 6, headline: "Flotilla prepares to sail", url: "https://example.com/1" },
        { id: "s2", outlet: "The Guardian", bias: "left", hoursAgo: 8, headline: "Activists gather for Gaza aid", url: "https://example.com/2" },
        { id: "s3", outlet: "Fox News", bias: "right", hoursAgo: 10, headline: "Controversial flotilla draws criticism", url: "https://example.com/3" },
      ],
    },
    {
      id: "c2",
      slug: "ai-safety-debate",
      title: "Tech leaders clash over AI safety rules as adoption accelerates",
      summary: [
        "Open letters and policy proposals multiply",
        "EU and US consider stricter guardrails",
      ],
      coverage: { left: 8, center: 10, right: 6, total: 24 },
      sourceCount: 24,
      sources: [
        { id: "s4", outlet: "BBC News", bias: "center", hoursAgo: 4, headline: "AI regulation talks intensify", url: "https://example.com/4" },
        { id: "s5", outlet: "Wired", bias: "left", hoursAgo: 12, headline: "Startups react to AI safety rules", url: "https://example.com/5" },
      ],
    },
  ];
}

export function getCluster(slug) {
  return getClusters().find((c) => c.slug === slug) || null;
}

export function getInterest(slug) {
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  return {
    id: `i-${slug}`,
    slug,
    name,
    iconUrl: null,
    bias: "center",
    factuality: "high",
    ownership: ["Independent"],
    topicsMostCovered: ["Artificial Intelligence", "Politics", "Middle East"],
    similarSources: ["reuters", "bbc-news", "ap-news"],
    latest: getClusters().slice(0, 5),
  };
}
