// middleware/protectInternal.js
// Protects all internal/diagnostic endpoints

export function protectInternalEndpoints(req, res, next) {
  const validToken = process.env.INTERNAL_ACCESS_TOKEN;
  
  // Get token from URL or header
  const providedToken = 
    req.query.token || 
    req.headers['x-access-token'];
  
  // Check if token matches
  if (!providedToken || providedToken !== validToken) {
    console.warn('⚠️ Unauthorized access attempt to:', req.path);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Valid access token required'
    });
  }
  
  console.log('✅ Authorized access to:', req.path);
  next();
}