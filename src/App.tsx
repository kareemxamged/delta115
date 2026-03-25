import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import StudentDashboard from './pages/StudentDashboard';
import ExamsList from './pages/student/ExamsList';
import ExamDetails from './pages/student/ExamDetails';
import ExamEngine from './pages/student/ExamEngine/ExamEngine';
import ExamResult from './pages/student/ExamResult/ExamResult';
import ExamReview from './pages/student/ExamReview/ExamReview';
import StudentResults from './pages/student/StudentResults';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetails from './pages/student/StudentCourseDetails';
import StudentProfile from './pages/student/StudentProfile';
// ...
import TeacherDashboard from './pages/TeacherDashboard';
import ExamCreator from './features/exam-creator/ExamCreator';
import ManageExams from './pages/teacher/ManageExams/ManageExams';
import TeacherProfile from './pages/teacher/TeacherProfile/TeacherProfile';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import RootRedirect from './components/RootRedirect';
import Layout from './components/Layout';

function App() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ... rest of routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes wrapped in common Layout */}

            {/* Fullscreen Exam Route (No Sidebar) */}
            <Route element={<PrivateRoute allowedRoles={['student']} />}>
                <Route path="/student/exams/:id/take" element={<ExamEngine />} />
            </Route>

            <Route element={<Layout />}>
                {/* Student Routes */}
                <Route element={<PrivateRoute allowedRoles={['student']} />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/exams" element={<ExamsList />} />
                    <Route path="/student/exams/:id" element={<ExamDetails />} />
                    <Route path="/student/exams/:id/result" element={<ExamResult />} />
                    <Route path="/student/exams/:id/review" element={<ExamReview />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/schedule" element={<StudentSchedule />} />
                    <Route path="/student/courses" element={<StudentCourses />} />
                    <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
                    <Route path="/student/profile" element={<StudentProfile />} />
                    <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />
                </Route>

                {/* Teacher Routes */}
                <Route element={<PrivateRoute allowedRoles={['teacher', 'admin']} />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/create-exam" element={<ExamCreator />} />
                    <Route path="/teacher/exams" element={<ManageExams />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />} />
                    <Route path="/teacher/*" element={<Navigate to="/teacher/dashboard" replace />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
