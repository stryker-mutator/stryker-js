/**
 * Thresholds for mutation score. Disable a score with `null`.
 *
 *  mutation score < break => exit build process with exit code 1. By default this is disabled (null).
 *  mutation score < low => score is in danger zone, display in red.
 *  mutation score < high >= low => score is in warning zone, display in yellow.
 *  mutation score >= high => score is in awesome zone, display in green.
 */
interface MutationScoreThresholds {
  high: number;
  low: number;
  break: number | null;
}

export default MutationScoreThresholds;
