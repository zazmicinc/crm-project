import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';
import DealsPage from './pages/DealsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/deals" element={<DealsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
