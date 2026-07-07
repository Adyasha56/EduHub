import User from "../models/User.js";
import {
  generateRecommendations,
  shouldRegenerate,
  canRefreshNow,
} from "../services/recommendationService.js";

// Get recommendations (with caching & LLM generation)
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if profile is complete
    const isProfileComplete =
      user.branch &&
      user.year &&
      user.careerGoal &&
      user.skills?.length >= 1;

    if (!isProfileComplete) {
      return res.status(400).json({
        error: "Profile incomplete",
        message:
          "Please complete your profile (career goal and at least one skill) to get recommendations",
        incompleteFields: {
          careerGoal: !user.careerGoal,
          skills: !user.skills || user.skills.length === 0,
        },
      });
    }

    // Return cached recommendations if available and valid
    if (
      user.recommendations?.data &&
      !shouldRegenerate(user)
    ) {
      return res.status(200).json({
        data: user.recommendations.data,
        cached: true,
        provider: user.recommendations.provider,
        generatedAt: user.recommendations.generatedAt,
        expiresAt: user.recommendations.expiresAt,
      });
    }

    // Generate new recommendations
    const recommendations = await generateRecommendations(user, false);

    // Save to database
    user.recommendations = recommendations;
    await user.save();

    return res.status(200).json({
      data: recommendations.data,
      cached: false,
      provider: recommendations.provider,
      generatedAt: recommendations.generatedAt,
      expiresAt: recommendations.expiresAt,
    });
  } catch (err) {
    console.error("Get recommendations error:", err.message);

    if (err.message.includes("Refresh available")) {
      return res.status(429).json({ error: err.message });
    }

    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
};

// Refresh recommendations (with rate limiting)
export const refreshRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check refresh rate limit
    if (!canRefreshNow(user)) {
      const daysSinceRefresh =
        (new Date() - new Date(user.recommendations.lastManualRefresh)) /
        (1000 * 60 * 60 * 24);
      const daysRemaining = Math.ceil(5 - daysSinceRefresh);

      return res.status(429).json({
        error: `Refresh available in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`,
        nextRefreshDate: new Date(
          new Date(user.recommendations.lastManualRefresh).getTime() +
            5 * 24 * 60 * 60 * 1000
        ),
      });
    }

    // Generate fresh recommendations
    const recommendations = await generateRecommendations(user, true);

    // Save to database
    user.recommendations = recommendations;
    await user.save();

    return res.status(200).json({
      data: recommendations.data,
      provider: recommendations.provider,
      generatedAt: recommendations.generatedAt,
      message: "Recommendations refreshed successfully",
    });
  } catch (err) {
    console.error("Refresh recommendations error:", err.message);
    return res.status(500).json({ error: "Failed to refresh recommendations" });
  }
};

