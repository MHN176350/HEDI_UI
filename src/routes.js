import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HealthMetricsPage from "./pages/HealthMetricsPage";
import HeartRatePage from "./pages/HeartRatePage";
import OnboardingPage from "./pages/OnboardingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/metrics",
    Component: HealthMetricsPage,
  },
  {
  path: "/onboarding",
  Component: OnboardingPage,
  },
  {
    path: "/heart-rate",
    Component: HeartRatePage,
  },
]);
