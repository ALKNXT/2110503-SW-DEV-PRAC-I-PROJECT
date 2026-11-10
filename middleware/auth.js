const jwt = require('jsonwebtoken');
const User = require('../models/User');

//protect routes
exports.protect= async(req,res,next)=>{
    const authorization = req.get('authorization') || '';
    const bearerMatch = authorization.match(/^Bearer\s+(\S+)$/i);
    const token = bearerMatch && bearerMatch[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || Number(decoded.tokenVersion ?? 0) !== Number(user.tokenVersion ?? 0)) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

exports.authorize=(...roles)=>{
    return (req,res,next)=>{
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Your role is not authorized to access this route' });
        }
        next();
    }
}
