export function runOptimizationEnhancer({ mode, baseResponse, message }) {
  const messageLC = message.toLowerCase();
  let tips = [];
  
  if (messageLC.includes('cost') || messageLC.includes('expensive')) {
    tips.push("💡 Cost Optimization: Look for simpler approaches that maintain quality");
  }
  
  if (messageLC.includes('time') || messageLC.includes('quick')) {
    tips.push("⚡ Time Optimization: Focus on the 20% that gets 80% of results");
  }
  
  let enhancedResponse = baseResponse;
  
  if (tips.length > 0) {
    enhancedResponse += '\n\n🎯 **OPTIMIZATION:**\n' + tips.join('\n');
  }
  
  return {
    enhancedResponse,
    optimization_tags: tips
  };
}
