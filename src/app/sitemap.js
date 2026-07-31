import properties from "@/data/properties";
import agents from "@/data/agents";
import { SITE_URL } from "@/lib/siteUrl";

export default function sitemap() {
  const staticRoutes = ["", "/about", "/agents", "/properties", "/contact", "/faq", "/reviews"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const propertyRoutes = properties.map((p) => ({
    url: `${SITE_URL}/properties/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const agentRoutes = agents.map((a) => ({
    url: `${SITE_URL}/agents/${a.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...agentRoutes];
}
