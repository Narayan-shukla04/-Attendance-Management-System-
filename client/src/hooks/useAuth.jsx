import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser, loginUser, logoutUser } from "../feature/AuthSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const login = (credentials) => dispatch(loginUser(credentials));
  const logout = () => dispatch(logoutUser());
  const checkSession = () => dispatch(fetchCurrentUser());

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    role: user?.role,
    login,
    logout,
    checkSession,
  };
}
