

const logAction=(action, user, details)=> {
  return {
    action,
    by: user,
    timestamp: new Date().toISOString(),
    details,
  };
}

export default logAction ;
