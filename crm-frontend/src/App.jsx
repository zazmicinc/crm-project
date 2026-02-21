import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import DealDetailPage from './pages/DealDetailPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import PipelineSettingsPage from './pages/PipelineSettingsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                    <Route path="*" element={
                        <PrivateRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<DashboardPage />} />
                                    <Route path="/contacts" element={<ContactsPage />} />
                                    <Route path="/contacts/:id" element={<ContactDetailPage />} />
                                    <Route path="/deals" element={<KanbanBoardPage />} />
                                    <Route path="/deals/:id" element={<DealDetailPage />} />
                                    <Route path="/accounts" element={<AccountsPage />} />
                                    <Route path="/accounts/:id" element={<AccountDetailPage />} />
                                    <Route path="/leads" element={<LeadsPage />} />
                                    <Route path="/leads/:id" element={<LeadDetailPage />} />
                                    <Route path="/settings/pipelines" element={<PipelineSettingsPage />} />
                                    <Route path="/admin/users" element={<UsersPage />} />
                                </Routes>
                            </Layout>
                        </PrivateRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
