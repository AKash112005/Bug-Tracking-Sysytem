export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};
