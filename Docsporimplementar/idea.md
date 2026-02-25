ejemplo de codigo propuesto por alguien en mi equipo:


import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  Dna, 
  ChevronRight, 
  Mail, 
  Lock, 
  Globe, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Fingerprint
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('welcome'); // welcome, login, register, onboarding
  const [userRole, setUserRole] = useState(null); // 'med' (Doctor), 'bio' (Manufacturer), 'admin'
  const [loading, setLoading] = useState(false);

  // Simulación de cambio de vista con transiciones
  const navigateTo = (nextView) => {
    setLoading(true);
    setTimeout(() => {
      setView(nextView);
      setLoading(false);
    }, 600);
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Lado Izquierdo: Branding y Valor */}
      <div className="w-full md:w-1/2 bg-slate-950 p-8 md:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">D</div>
            <span className="text-2xl font-semibold tracking-tight">DeepLux</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            La inteligencia que <br /> 
            <span className="text-blue-500">potencia tu práctica clínica.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Ecosistema integral de salud digital, manufactura biocompatible y gestión de activos médicos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-12">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="bg-blue-600/20 p-2 rounded-lg"><Stethoscope className="text-blue-400" size={20} /></div>
            <div>
              <h3 className="font-medium text-slate-200">DeepLux Med</h3>
              <p className="text-sm text-slate-500 italic">Expediente Clínico & IA Diagnóstica (DeepSeek R1)</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="bg-emerald-600/20 p-2 rounded-lg"><Dna className="text-emerald-400" size={20} /></div>
            <div>
              <h3 className="font-medium text-slate-200">DeepLux Bio</h3>
              <p className="text-sm text-slate-500 italic">Manufactura Aditiva y Prótesis 3D</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-500 flex gap-4">
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> HIPAA Compliant</span>
          <span className="flex items-center gap-1"><Globe size={14} /> GDPR Ready</span>
          <span className="flex items-center gap-1 text-blue-400"><CheckCircle2 size={14} /> NOM-024 (MX)</span>
        </div>
      </div>

      {/* Lado Derecho: Acciones Rápidas */}
      <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h2>
          <p className="text-slate-500 mb-10">Selecciona tu puerta de acceso al ecosistema.</p>

          <div className="space-y-4">
            <button 
              onClick={() => navigateTo('login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-between transition-all group"
            >
              <span>Entrar con DeepLux ID</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400 font-medium">¿Nuevo en el grupo?</span></div>
            </div>

            <button 
              onClick={() => navigateTo('register')}
              className="w-full bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-semibold py-4 px-6 rounded-xl transition-all"
            >
              Crear cuenta profesional
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginScreen = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-blue-100 rounded-full items-center justify-center mb-4 text-blue-600 font-bold text-2xl tracking-tighter">DL</div>
          <h2 className="text-2xl font-bold text-slate-900">Acceso Seguro</h2>
          <p className="text-slate-500">Ingresa a tu consultorio digital unificado</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="ejemplo@doctor.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">¿Olvidaste tu acceso?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button className="w-full bg-slate-950 text-white font-bold py-4 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
            Iniciar Sesión
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">O entrar con</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <span className="font-medium text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700">
              <Fingerprint size={18} />
              <span className="font-medium">Biometría</span>
            </button>
          </div>
        </form>

        <button 
          onClick={() => setView('welcome')}
          className="mt-8 w-full text-slate-500 text-sm hover:text-slate-900 flex items-center justify-center gap-1"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );

  const RegisterScreen = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-center gap-2 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white text-sm">D</div>
            <span className="text-xl font-semibold text-slate-900">DeepLux Registry</span>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Comienza tu transformación digital</h2>
          <p className="text-slate-500 max-w-md mx-auto">Selecciona tu perfil profesional para personalizar tu experiencia en el ecosistema.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <button 
            onClick={() => setUserRole('med')}
            className={`p-8 rounded-3xl border-2 text-left transition-all ${userRole === 'med' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${userRole === 'med' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <Stethoscope size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clínico / Médico</h3>
            <p className="text-sm text-slate-500">Acceso a ExpedienteDLM, Escalas funcionales e IA médica.</p>
          </button>

          <button 
            onClick={() => setUserRole('bio')}
            className={`p-8 rounded-3xl border-2 text-left transition-all ${userRole === 'bio' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-300'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${userRole === 'bio' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <Dna size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bio-Ingeniería / Prótesis</h3>
            <p className="text-sm text-slate-500">Diseño 3D, gestión de materiales y manufactura aditiva.</p>
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            disabled={!userRole}
            onClick={() => alert(`Iniciando registro para perfil: ${userRole}`)}
            className={`w-full max-w-sm font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${userRole ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Continuar con el Registro
            <ChevronRight size={20} />
          </button>
          
          <button onClick={() => setView('welcome')} className="text-slate-400 text-sm hover:text-slate-600">
            Ya tengo una cuenta DeepLux
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-900 overflow-x-hidden">
      {view === 'welcome' && <WelcomeScreen />}
      {view === 'login' && <LoginScreen />}
      {view === 'register' && <RegisterScreen />}
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <span className="text-slate-600 font-medium">Sincronizando identidad...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;