

const users = {
  netrunnerX: 'admin',
  reliefAdmin: 'contributor',
};

const auth=(requiredRole)=> {
  return (req, res, next) => {

    const user = req.headers['x-user'];

    req.user = { name: user, role: users[user] || 'guest' };

    if (requiredRole && req.user.role !== requiredRole) {

      return res.status(403).json({ error: 'Forbidden' });
      
    }
    next();
  };
}

export default auth;
