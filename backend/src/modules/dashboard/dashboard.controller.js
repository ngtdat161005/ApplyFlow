import { getDashboardSummary } from "./dashboard.service.js";

export async function summary(req, res) {
  const dashboard = await getDashboardSummary(req.user.id);

  res.status(200).json({
    success: true,
    dashboard,
  });
}
