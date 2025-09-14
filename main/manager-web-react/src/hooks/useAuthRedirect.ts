import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * 认证跳转 Hook
 * - 在已认证时访问登录/注册/找回页，自动跳到 /home
 * - 暴露 isAuthenticated 与 loading，供外层渲染受控
 */
export const useAuthRedirect = () => {
  const {
    state: { isAuthenticated, loading },
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const authPages = new Set(["/login", "/register", "/retrieve-password"]);
    if (isAuthenticated && authPages.has(location.pathname)) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return { isAuthenticated, loading };
};
