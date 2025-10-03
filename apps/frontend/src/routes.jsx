import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Cadastro from './pages/Cadastro';
import CadastroEmail from "./pages/CadastroEmail";
import CadastroGoogle from "./pages/CadastroGoogle";
import CadastroFacebook from "./pages/CadastroFacebook";
import CadastroEscolha from './pages/CadastroEscolha';
import SucessoPage from './pages/SucessoPage';
import LoginPage from './pages/LoginPage';
import AssinaturaPage from './pages/AssinaturaPage';
import QrCodePage from './pages/QrCodePage';
import Dashboard from './pages/Dashboard';
import ConfigurarWhatsapp from './pages/ConfigurarWhatsapp';
import CompletarCadastro from './pages/CompletarCadastro';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cadastro/email" element={<CadastroEmail />} />
      <Route path="/cadastro/google" element={<CadastroGoogle />} />
      <Route path="/cadastro/facebook" element={<CadastroFacebook />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/escolha" element={<CadastroEscolha />} />
      <Route path="/sucesso" element={<SucessoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/assinatura" element={<AssinaturaPage />} />
      <Route path="/qrcode" element={<QrCodePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/configurar-whatsapp" element={<ConfigurarWhatsapp />} />
      <Route path="/completar-cadastro" element={<CompletarCadastro />} />
    </Routes>
  );
}
