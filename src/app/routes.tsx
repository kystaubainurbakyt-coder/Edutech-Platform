import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import LearningCourse from "./pages/LearningCourse";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "learning/:courseId",
        element: (
          <ProtectedRoute>
            <LearningCourse />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly={true}>
            <Admin />
          </ProtectedRoute>
        ),
      },
      { path: "courses", Component: Courses },
      { path: "register", Component: Register },
      { path: "login", Component: Login },
      { path: "admin/login", Component: AdminLogin },
      { path: "about", Component: About },
      { path: "pricing", Component: Pricing },
    ],
  },
]);
