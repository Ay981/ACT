import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Messages from './pages/Messages.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Courses from './pages/Courses.jsx'
import QuizStart from './pages/QuizStart.jsx'
import QuizTake from './pages/QuizTake.jsx'
import QuizResult from './pages/QuizResult.jsx'
import QuizResults from './pages/QuizResults.jsx'
import InstructorQuizNew from './pages/InstructorQuizNew.jsx'
import InstructorQuizShare from './pages/InstructorQuizShare.jsx'
import InstructorQuizzesList from './pages/InstructorQuizzesList.jsx'
import InstructorQuizResults from './pages/InstructorQuizResults.jsx'
import InstructorCourseNew from './pages/InstructorCourseNew.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminReports from './pages/AdminReports.jsx'
import AdminInstructors from './pages/AdminInstructors.jsx'
import ProtectedInstructor from './components/ProtectedInstructor.jsx'
import ProtectedAdmin from './components/ProtectedAdmin.jsx'
import ProtectedAuth from './components/ProtectedAuth.jsx'
import ProtectedGuest from './components/ProtectedGuest.jsx'
import InstructorDashboard from './pages/InstructorDashboard.jsx'
import Settings from './pages/Settings.jsx'
import SignUp from './pages/SignUp.jsx'
import VerifyOtp from './pages/VerifyOtp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Maintenance from './pages/Maintenance.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/login" element={<ProtectedGuest><Login /></ProtectedGuest>} />
      <Route path="/signup" element={<ProtectedGuest><SignUp /></ProtectedGuest>} />
      <Route path="/verify-otp" element={<ProtectedGuest><VerifyOtp /></ProtectedGuest>} />
      <Route path="/forgot-password" element={<ProtectedGuest><ForgotPassword /></ProtectedGuest>} />

      <Route path="/dashboard" element={<ProtectedAuth><Dashboard /></ProtectedAuth>} />
      <Route path="/courses" element={<ProtectedAuth><Courses /></ProtectedAuth>} />
      <Route path="/messages" element={<ProtectedAuth><Messages /></ProtectedAuth>} />
      <Route path="/courses/:id" element={<ProtectedAuth><CourseDetail /></ProtectedAuth>} />
      <Route path="/results" element={<ProtectedAuth><QuizResults /></ProtectedAuth>} />

      <Route path="/instructor/quizzes" element={<ProtectedAuth><ProtectedInstructor><InstructorQuizzesList /></ProtectedInstructor></ProtectedAuth>} />
      <Route path="/instructor/dashboard" element={<ProtectedAuth><ProtectedInstructor><InstructorDashboard /></ProtectedInstructor></ProtectedAuth>} />
      <Route path="/instructor/quizzes/new" element={<ProtectedAuth><ProtectedInstructor><InstructorQuizNew /></ProtectedInstructor></ProtectedAuth>} />
      <Route path="/instructor/courses/new" element={<ProtectedAuth><ProtectedInstructor><InstructorCourseNew /></ProtectedInstructor></ProtectedAuth>} />
      <Route path="/instructor/quizzes/:id/share" element={<ProtectedAuth><ProtectedInstructor><InstructorQuizShare /></ProtectedInstructor></ProtectedAuth>} />
      <Route path="/instructor/quizzes/:id/results" element={<ProtectedAuth><ProtectedInstructor><InstructorQuizResults /></ProtectedInstructor></ProtectedAuth>} />

      <Route path="/admin/dashboard" element={<ProtectedAuth><ProtectedAdmin><AdminDashboard /></ProtectedAdmin></ProtectedAuth>} />
      <Route path="/admin/reports" element={<ProtectedAuth><ProtectedAdmin><AdminReports /></ProtectedAdmin></ProtectedAuth>} />
      <Route path="/admin/instructors" element={<ProtectedAuth><ProtectedAdmin><AdminInstructors /></ProtectedAdmin></ProtectedAuth>} />

      <Route path="/quiz/:id" element={<ProtectedAuth><QuizTake /></ProtectedAuth>} />
      <Route path="/quizzes/:id/start" element={<ProtectedAuth><QuizStart /></ProtectedAuth>} />
      <Route path="/quizzes/:id/take" element={<ProtectedAuth><QuizTake /></ProtectedAuth>} />
      <Route path="/quizzes/:id/result" element={<ProtectedAuth><QuizResult /></ProtectedAuth>} />
      <Route path="/settings" element={<ProtectedAuth><Settings /></ProtectedAuth>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
