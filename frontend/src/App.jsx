import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import VideoPlayer from './pages/VideoPlayer'
import Quiz from './pages/Quiz'
import Jobs from './pages/Jobs'
import Progress from './pages/Progress'
import Mentors from './pages/Mentors'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Notifications from './pages/Notifications'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminJobs from './pages/admin/AdminJobs'
import AdminUsers from './pages/admin/AdminUsers'
import AdminMentorRequests from './pages/admin/AdminMentorRequests'
import AdminFreelancerRequests from './pages/admin/AdminFreelancerRequests'
import AdminFinance from './pages/admin/AdminFinance'
import AdminChat from './pages/admin/AdminChat'

import MentorDashboard from './pages/mentor/MentorDashboard'
import MentorRequests from './pages/mentor/MentorRequests'
import FinanceDashboard from './pages/finance/FinanceDashboard'
import TransactionsPage from './pages/finance/TransactionsPage'
import BudgetsPage from './pages/finance/BudgetsPage'
import GoalsPage from './pages/finance/GoalsPage'
import CalculatorsPage from './pages/finance/CalculatorsPage'
import ReportsPage from './pages/finance/ReportsPage'
import FinanceAdminDashboard from './pages/finance-admin/FinanceAdminDashboard'
import FinanceTipsAdminPage from './pages/finance-admin/FinanceTipsAdminPage'

// Freelancer pages
import FreelancerLanding from './pages/freelancer/FreelancerLanding'
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard'
import FreelancerServices from './pages/freelancer/FreelancerServices'
import BrowseProjects from './pages/freelancer/BrowseProjects'
import FreelancerProposals from './pages/freelancer/FreelancerProposals'
import FreelancerOrders from './pages/freelancer/FreelancerOrders'
import FreelancerEarnings from './pages/freelancer/FreelancerEarnings'
import PostProject from './pages/freelancer/PostProject'
import MyProjects from './pages/freelancer/MyProjects'
import ClientOrders from './pages/freelancer/ClientOrders'
import FreelanceChat from './pages/freelancer/FreelanceChat'
import FreelanceMessages from './pages/freelancer/FreelanceMessages'
import ClientFreelanceOverview from './pages/freelancer/ClientFreelanceOverview'
import BrowseServices from './pages/freelancer/BrowseServices'


import RoleSelect from './pages/RoleSelect'
import BecomeFreelancerForm from './pages/freelancer/BecomeFreelancerForm'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/role-select" element={<RoleSelect />} />

                <Route element={<ProtectedRoute allowedRoles={['user', 'client', 'admin', 'finance_admin', 'freelancer', 'mentor']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/courses/:id/watch" element={<VideoPlayer />} />
                    <Route path="/quiz/:id" element={<Quiz />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/mentors" element={<Mentors />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    
                    {/* Messaging System */}
                    <Route path="/messages" element={<FreelanceMessages />} />
                    <Route path="/messages/:conversationId" element={<FreelanceMessages />} />

                    <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                    <Route path="/finance/transactions" element={<TransactionsPage />} />
                    <Route path="/finance/budgets" element={<BudgetsPage />} />
                    <Route path="/finance/goals" element={<GoalsPage />} />
                    <Route path="/finance/calculators" element={<CalculatorsPage />} />
                    <Route path="/finance/reports" element={<ReportsPage />} />
                    <Route path="/freelancer" element={<FreelancerLanding />} />
                    <Route path="/freelancer/become" element={<BecomeFreelancerForm />} />
                    <Route path="/freelancer/client-dashboard" element={<ClientFreelanceOverview />} />
                    <Route path="/freelancer/projects/post" element={<PostProject />} />
                    <Route path="/freelancer/projects/mine" element={<MyProjects />} />
                    <Route path="/freelancer/orders" element={<ClientOrders />} />
                    <Route path="/freelancer/services/browse" element={<BrowseServices />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['finance_admin', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/finance-admin/dashboard" element={<FinanceAdminDashboard />} />
                    <Route path="/finance-admin/tips" element={<FinanceTipsAdminPage />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/courses" element={<AdminCourses />} />
                    <Route path="/admin/jobs" element={<AdminJobs />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/mentor-requests" element={<AdminMentorRequests />} />
                    <Route path="/admin/freelancer-requests" element={<AdminFreelancerRequests />} />
                    <Route path="/admin/finance" element={<AdminFinance />} />
                    <Route path="/admin/finance/transactions" element={<AdminFinance initialTab="Transactions" />} />
                    <Route path="/admin/finance/tips" element={<AdminFinance initialTab="Tips Management" />} />
                    <Route path="/admin/chat" element={<AdminChat />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/mentor/dashboard" element={<MentorDashboard />} />
                    <Route path="/mentor/requests" element={<MentorRequests />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
                    <Route path="/freelancer/services" element={<FreelancerServices />} />
                    <Route path="/freelancer/browse" element={<BrowseProjects />} />
                    <Route path="/freelancer/proposals" element={<FreelancerProposals />} />
                    <Route path="/freelancer/orders/freelancer" element={<FreelancerOrders />} />
                    <Route path="/freelancer/earnings" element={<FreelancerEarnings />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

