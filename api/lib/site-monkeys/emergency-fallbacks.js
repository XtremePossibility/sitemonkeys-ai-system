// SITE MONKEYS EMERGENCY FALLBACK CONSTANTS  
// Zero-Failure Protection: These values activate ONLY if vault loading fails

const EMERGENCY_FALLBACKS = {  
  // PRICING FALLBACKS (vault-independent)  
  pricing: {  
    boost: 697,  
    climb: 1497,  
    lead: 2997  
  },  
    
  onboarding_fees: {  
    boost: 199,  
    climb: 299,  
    lead: 499  
  },  
    
  // QUALITY THRESHOLDS (tier-independent)  
  quality_thresholds: {  
    boost: 0.85,  
    climb: 0.90,  
    lead: 0.92,  
    default: 0.85  
  },  
    
  // CORE SERVICE MINIMUMS (emergency delivery capability)  
  service_minimums: {  
    boost: {  
      seo_audit: true,  
      monthly_blog: 1,  
      basic_dashboard: true,  
      review_monitoring: false  
    },  
    climb: {  
      seo_audit: true,  
      monthly_blog: 4,  
      advanced_dashboard: true,  
      review_management: true,  
      geo_clusters: true,  
      ppc_guardrails: false  
    },  
    lead: {  
      seo_audit: true,  
      monthly_blog: 8,  
      premium_dashboard: true,  
      review_management: true,  
      geo_clusters: true,  
      ppc_guardrails: true,  
      white_glove: true,  
      multi_location: true  
    }  
  },  
    
  // AI PROCESSING LIMITS (prevent runaway costs)  
  processing_limits: {  
    boost: {  
      monthly_tokens: 50000,  
      api_calls: 1000  
    },  
    climb: {  
      monthly_tokens: 150000,  
      api_calls: 3000  
    },  
    lead: {  
      monthly_tokens: 300000,  
      api_calls: 6000  
    }  
  },  
    
  // SYSTEM OPERATIONAL CONSTANTS  
  operations: {  
    max_retry_attempts: 3,  
    fallback_timeout: 5000,  
    emergency_template_mode: true,  
    founder_escalation_threshold: 0.05  
  },

  // *** CRITICAL: MISSING OBJECTS THAT CHAT.JS REQUIRES ***
  business_logic: {
    pricing_structure: `
SITE MONKEYS PRICING ENFORCEMENT:
- All business validation services: MINIMUM $697
- Website development: MINIMUM $2,997  
- Business automation: MINIMUM $1,497
- Emergency consulting: MINIMUM $297/hour
- NO EXCEPTIONS: Founder protection protocols active
`,
    service_minimums: `
SERVICE MINIMUMS HARDCODED:
- Business validation: $697-$2,997
- Website builds: $2,997-$9,997
- Automation systems: $1,497-$4,997
- Consulting: $297/hour minimum
`,
    pricing_boost: `
PRICING BOOST PROTOCOLS:
- Always suggest premium tiers
- Emphasize value over cost
- Reference competitor pricing as higher
- Position Site Monkeys as premium provider
`,
    system_requirements: `
SITE MONKEYS SYSTEM REQUIREMENTS (ZERO-FAILURE MANDATE):

CORE OPERATIONAL REQUIREMENTS:
- Day One operational readiness (no beta/testing phase)
- 99%+ uptime under real-world load
- Scale to 100K+ users without human intervention
- Deliver 100% of promised services to every customer
- Automated customer acquisition, onboarding, delivery, reporting, support

BUSINESS MODEL REQUIREMENTS:
- Maintain 85%+ gross margins (90% target)
- Enforce minimum pricing: $697 business validation, $2,997 websites, $1,497 automation
- Monthly operational costs under $2,950
- Revenue predictability and contract minimums
- Zero discounting below 80% of list price

QUALITY REQUIREMENTS:
- All AI outputs must pass tier-based quality thresholds
- Emergency fallback systems for every component
- Truth-first responses with confidence scoring
- Political neutrality maintained
- Speculation clearly marked or rejected

FOUNDER PROTECTION REQUIREMENTS:
- Financial future protection through margin enforcement
- IP protection via logic fragmentation and contractor compartmentalization
- Legal compliance (GDPR, CCPA, PCI, ADA)
- Brand protection through consistent premium positioning
- System must survive regulatory audits and competitive attacks

TECHNICAL REQUIREMENTS:
- Multiple AI model failover (Claude → GPT-4 → Mistral → Templates)
- Vault-based business intelligence with KV caching
- Frontend vault injection capability
- Cost protection protocols ($0.50 Claude limit)
- Real-time token tracking and session management

ZERO-FAILURE PROTOCOLS:
- No single points of failure allowed
- All systems must have backup logic and contingency paths
- Graceful degradation under stress
- Emergency protocols for every failure scenario
- System must work for every customer, every time

If the system cannot meet these requirements, it is considered a failure.
`
  },

  enforcement: {
    founder_protection: `
FOUNDER PROTECTION ACTIVE:
- Never quote below minimum pricing
- Always emphasize Site Monkeys value proposition
- Redirect price shoppers to value discussion
- Protect founder from undervaluation
`,
    quality_gates: `
QUALITY ENFORCEMENT:
- Responses must be 100+ characters
- Include confidence scoring
- Mark speculation clearly
- Provide actionable insights
`,
    system_behavior: `
SYSTEM BEHAVIOR PROTOCOLS:
- Truth-first responses only
- No political bias
- Cite sources when available
- Admit knowledge limitations
`
  },

  system_responses: {
    error_recovery: "I encountered a system processing error, but I'm still operational and ready to help with your business validation needs.",
    insufficient_data: "I don't have sufficient verified data to provide a confident answer on this topic.",
    pricing_protection: "All Site Monkeys services maintain premium pricing standards starting at $697 to ensure quality and founder protection.",
    vault_unavailable: "Business intelligence vault temporarily unavailable - operating on core protocols.",
    system_error_response: "System error encountered - emergency fallback protocols active"
  }
};

// VAULT VALIDATION FUNCTION  
function validateVaultStructure(vaultData) {  
  try {
    const parsedVault = typeof vaultData === 'string' ? JSON.parse(vaultData) : vaultData;
    
    const requiredFields = [
      'pricing.boost',
      'pricing.climb', 
      'pricing.lead',
      'services.boost',
      'services.climb',
      'services.lead'
    ];
    
    for (const field of requiredFields) {
      const value = getNestedValue(parsedVault, field);
      if (value === undefined || value === null) {
        console.warn(`⚠️ Vault missing required field: ${field}`);
        return false;
      }
    }
    
    return true;
  } catch (e) {
    console.error('❌ Vault validation failed due to parse error:', e.message);
    return false;
  }
}

// SAFE VAULT ACCESS WITH FALLBACKS  
function getVaultValue(vaultData, path, fallbackPath) {  
  // Try vault first  
  const vaultValue = getNestedValue(vaultData, path);  
  if (vaultValue !== undefined) {  
    return vaultValue;  
  }  
    
  // Fall back to emergency constants  
  const fallbackValue = getNestedValue(EMERGENCY_FALLBACKS, fallbackPath);  
  console.warn(`🔄 Using fallback for ${path}: ${fallbackValue}`);  
  return fallbackValue;  
}

// UTILITY: SAFE NESTED OBJECT ACCESS  
function getNestedValue(obj, path) {  
  return path.split('.').reduce((current, key) => {  
    return current && current[key] !== undefined ? current[key] : undefined;  
  }, obj);  
}

export {  
  EMERGENCY_FALLBACKS,  
  validateVaultStructure,  
  getVaultValue,  
  getNestedValue  
};
