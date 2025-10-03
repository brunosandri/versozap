import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full py-4 px-6 bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-700">VersoZap</Link>
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(true)} className="text-green-700 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <nav className="hidden md:flex gap-4">
            <Link to="/cadastro" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm transition-all">
              Começar agora
            </Link>
          </nav>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-green-700">VersoZap</span>
              <button onClick={() => setMenuOpen(false)}>
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="w-16 h-16 rounded-full bg-green-100 mx-auto"></div>
            <p className="text-center text-sm text-gray-600 bg-gray-100 w-fit mx-auto px-3 py-1 rounded-full">Free</p>

            <nav className="flex flex-col gap-3 mt-6">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-800">Início</Link>
              <Link to="/cadastro" onClick={() => setMenuOpen(false)} className="text-gray-800">Cadastro</Link>
              <Link to="/assinatura" className="text-gray-800">Assinatura</Link>
              <button className="text-left text-gray-800">⤴ Sair</button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
