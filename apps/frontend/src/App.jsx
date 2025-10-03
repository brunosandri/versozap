// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Cadastro from './pages/Cadastro';
import CadastroEmail from './pages/CadastroEmail';
import CadastroGoogle from './pages/CadastroGoogle';
import CadastroFacebook from './pages/CadastroFacebook';
import CadastroEscolha from './pages/CadastroEscolha';
import CompletarCadastro from './pages/CompletarCadastro';
import ConfigurarWhatsapp from './pages/ConfigurarWhatsapp';
import Dashboard from './pages/Dashboard';
import SucessoPage from './pages/SucessoPage';


export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/cadastro' element={<Cadastro />} />
      <Route path='/cadastro/email' element={<CadastroEmail />} />
      <Route path='/cadastro/google' element={<CadastroGoogle />} />
      <Route path='/cadastro/facebook' element={<CadastroFacebook />} />
      <Route path='/escolha' element={<CadastroEscolha />} />
      <Route path='/completar-cadastro' element={<CompletarCadastro />} />
      <Route path='/configurar-whatsapp' element={<ConfigurarWhatsapp />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/sucesso' element={<SucessoPage />} />
    </Routes>
  );
}

