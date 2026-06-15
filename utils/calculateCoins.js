export function calculateCoinsEarned(totalSteps, stepsPerCoin) {
  return Math.floor(totalSteps / stepsPerCoin);
}

export function calculateRemainingCoins(totalSteps, coinsSpent, stepsPerCoin) {
  const earned = calculateCoinsEarned(totalSteps, stepsPerCoin);
  return Math.max(0, earned - coinsSpent);
}
