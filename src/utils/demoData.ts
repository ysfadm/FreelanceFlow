// Demo data for testing the application
export const demoJobs = [
  {
    id: "job_demo_1",
    client: "GAIUIZPHLIHQEMNJGSXIIDCEIQY7L2XXBR7PCKQJ3CZGLNCBZUR2L6J3",
    freelancer: "GBJSW6ZKRZYUQ6KXAQWAGWPGQK4F5HDKXQJ6VTQGLJUDYXPWKXFZXPQB",
    amount: "500.00",
    description: "Design a modern landing page for a fintech startup",
    status: "in_escrow",
    createdAt: new Date("2025-06-20T10:00:00Z"),
  },
  {
    id: "job_demo_2",
    client: "GBJSW6ZKRZYUQ6KXAQWAGWPGQK4F5HDKXQJ6VTQGLJUDYXPWKXFZXPQB",
    freelancer: "GAIUIZPHLIHQEMNJGSXIIDCEIQY7L2XXBR7PCKQJ3CZGLNCBZUR2L6J3",
    amount: "250.00",
    description: "Write technical documentation for API endpoints",
    status: "completed",
    createdAt: new Date("2025-06-19T14:30:00Z"),
    completedAt: new Date("2025-06-20T16:45:00Z"),
  },
] as const;
