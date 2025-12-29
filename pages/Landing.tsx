import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-[#111518] dark:text-white">
      {/* Header */}
      <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] dark:border-gray-800 bg-white dark:bg-[#101a22] px-4 py-3 sticky top-0 z-50 shadow-sm md:px-10">
        <div class="flex items-center gap-3 text-[#111518] dark:text-white">
          <div class="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
            <span class="material-symbols-outlined filled">electric_bolt</span>
          </div>
          <h2 class="text-lg font-bold leading-tight tracking-[-0.015em]">Taller Charli</h2>
        </div>
        <div class="hidden md:flex flex-1 justify-end gap-8">
          <nav class="flex items-center gap-8">
            <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Inicio</a>
            <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" href="#servicios">Servicios</a>
            <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" href="#nosotros">Nosotros</a>
            <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>Soy Cliente</a>
          </nav>
          <button 
            onClick={() => navigate('/book/step1')}
            class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-blue-600 transition-colors"
          >
            <span class="truncate">Agendar Turno</span>
          </button>
        </div>
        <button class="md:hidden flex items-center text-[#111518] dark:text-white">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main class="flex-1">
        {/* Hero Section */}
        <section 
          class="relative flex min-h-[500px] md:min-h-[600px] flex-col items-center justify-center overflow-hidden bg-cover bg-center p-4" 
          style={{backgroundImage: 'linear-gradient(rgba(16, 26, 34, 0.7) 0%, rgba(16, 26, 34, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAeblw65o0161TjwDw1tl2YX_bnUBn_lKZGar6kbdf2Vc9n2mChqc1PZtmGIGj4aP4CZDbEqzr-NMV_NQWHHb24MjGdJw1l6NQAA8rns05gb7jAFpY6WsXULZ9FmsEkdQJkphTCAKSXOn3v-2ysTrj7EVpUpBReJvQ6AJnbJh0rToWBG7JY0e3lDjS36CtrGbt9aOhj37P7SkqWVMz9-_EhWnlTuw2NA_viM07kJXBozF4LbOaClZlpffsM0x_H1gIUCoAjWXiTmW8")'}}
        >
          <div class="flex max-w-[800px] flex-col gap-6 text-center z-10">
            <div class="flex flex-col gap-4">
              <span class="mx-auto w-fit rounded-full bg-primary/20 px-4 py-1.5 text-sm font-bold text-blue-100 backdrop-blur-sm border border-primary/30">
                Transparencia y Eficiencia
              </span>
              <h1 class="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl">
                Soluciones Eléctricas <br/> para su Vehículo
              </h1>
              <p class="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto">
                Especialistas en camiones, tractores, autos y motos. Reparación de arranques, alternadores y diagnóstico computarizado.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/book/step1')}
                class="flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg hover:bg-blue-600 transition-transform hover:scale-105"
              >
                Solicitar Turno
              </button>
              <button class="flex h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 text-base font-bold text-white hover:bg-white/20 transition-colors">
                Ver Servicios
              </button>
            </div>
          </div>
        </section>

        {/* Vehicle Types Section */}
        <section class="py-12 md:py-16 px-4 md:px-10 bg-white dark:bg-[#101a22]">
          <div class="max-w-[960px] mx-auto">
            <div class="text-center mb-10">
              <h2 class="text-2xl md:text-3xl font-bold mb-3">Especialistas en Todo Tipo de Vehículo</h2>
              <p class="text-gray-500 dark:text-gray-400">Atendemos las necesidades específicas de su flota o vehículo personal.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'local_shipping', label: 'Camiones' },
                { icon: 'agriculture', label: 'Tractores' },
                { icon: 'directions_car', label: 'Autos' },
                { icon: 'two_wheeler', label: 'Motos' }
              ].map((item, i) => (
                <div key={i} class="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-[#152028] p-6 items-center text-center hover:shadow-md transition-shadow group cursor-default">
                  <div class="text-primary p-3 bg-white dark:bg-[#101a22] rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-4xl">{item.icon}</span>
                  </div>
                  <h3 class="text-lg font-bold">{item.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section class="py-12 md:py-16 px-4 md:px-10 bg-background-light dark:bg-[#0d141b]" id="servicios">
          <div class="max-w-[960px] mx-auto">
            <div class="flex justify-between items-end mb-8">
              <div>
                <h2 class="text-2xl md:text-3xl font-bold">Nuestros Servicios</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Soluciones integrales para el sistema eléctrico.</p>
              </div>
              <a class="hidden md:inline-flex items-center text-primary font-bold text-sm hover:underline" href="#">
                Ver todos <span class="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Cards */}
              <div class="bg-white dark:bg-[#152028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 text-primary p-3 rounded-lg h-fit">
                  <span class="material-symbols-outlined text-3xl">offline_bolt</span>
                </div>
                <div>
                  <h3 class="font-bold text-xl mb-2">Alternadores y Arranques</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    Reparación y mantenimiento experto de burros de arranque y alternadores. Stock permanente de repuestos para una solución rápida.
                  </p>
                  <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    {['Bobinado', 'Cambio de carbones', 'Pruebas de banco'].map((li, k) => (
                       <li key={k} class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>{li}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div class="bg-white dark:bg-[#152028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 text-primary p-3 rounded-lg h-fit">
                  <span class="material-symbols-outlined text-3xl">terminal</span>
                </div>
                <div>
                  <h3 class="font-bold text-xl mb-2">Diagnóstico Computarizado</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    Utilizamos tecnología de punta para identificar fallas electrónicas con precisión, ahorrando tiempo y dinero en reparaciones innecesarias.
                  </p>
                  <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                     {['Escaneo completo', 'Borrado de fallas', 'Chequeo de sensores'].map((li, k) => (
                       <li key={k} class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>{li}</li>
                    ))}
                  </ul>
                </div>
              </div>

               <div class="bg-white dark:bg-[#152028] p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                  <div class="bg-blue-50 dark:bg-blue-900/20 text-primary p-2 rounded-lg">
                    <span class="material-symbols-outlined text-2xl">battery_charging_full</span>
                  </div>
                  <div>
                    <h4 class="font-bold">Baterías</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Control de carga y ventas.</p>
                  </div>
                </div>

                <div class="bg-white dark:bg-[#152028] p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                  <div class="bg-blue-50 dark:bg-blue-900/20 text-primary p-2 rounded-lg">
                    <span class="material-symbols-outlined text-2xl">electrical_services</span>
                  </div>
                  <div>
                    <h4 class="font-bold">Cableado General</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Reparación de luces y fusibles.</p>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section class="py-12 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-[#101a22]">
            <div class="max-w-[960px] mx-auto px-4 md:px-10">
                <p class="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trabajamos con repuestos originales de primera calidad</p>
                <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-3xl">build_circle</span>
                        <span class="text-2xl font-black tracking-tighter">BOSCH</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold italic">DENSO</span>
                    </div>
                     <div class="flex items-center gap-2">
                        <div class="border-2 border-current px-1 text-sm font-bold">DR</div>
                        <span class="text-xl font-bold">Delco Remy</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xl font-black text-primary">DEKA</span>
                        <span class="text-xs font-bold uppercase tracking-widest">Batteries</span>
                    </div>
                </div>
            </div>
        </section>

        {/* Transparency Section */}
        <section class="py-16 px-4 md:px-10 bg-primary text-white" id="nosotros">
            <div class="max-w-[960px] mx-auto flex flex-col md:flex-row items-center gap-10">
                <div class="flex-1">
                    <h2 class="text-3xl font-bold mb-4">Compromiso con la Transparencia</h2>
                    <p class="text-blue-100 text-lg mb-6">
                        En Taller Charli, creemos que la confianza es la pieza más importante. Por eso, le explicamos exactamente qué falla, cómo lo arreglaremos y cuánto costará antes de empezar.
                    </p>
                    <ul class="space-y-3">
                        {['Presupuestos claros sin sorpresas', 'Garantía escrita en reparaciones', 'Devolución de repuestos reemplazados'].map((item, idx) => (
                             <li key={idx} class="flex items-center gap-3">
                                <span class="material-symbols-outlined bg-white/20 p-1 rounded-full text-sm">check</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div class="flex-1 relative w-full h-[300px] rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <div class="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBKrUvmk5Ebt17m7Yd6N9TfIMiLvDNSZPEwViNYkhv9xq6oc3agxZ3aDnu8NEslwkicjknY8c-H1dlvIO_f5b1yhrwu5zdRBtCjxhUiff15MX4-foIbQ09qALc7gQQ_juq5POPCqB4sMDNsDPPw12t8n5saNMQMBr3tVhZAoUEBoEsyMVNpbhWgPdZzUi6hX3RZsUyZHAZjIaNH1ipZxkq1znnhBKCh1fw1vO1hp1971FCALcwT9AmO9d4GVjv9ETeY4aax9KP8AdE")'}}></div>
                </div>
            </div>
        </section>

         {/* Contact & Map Section */}
        <section class="py-16 px-4 md:px-10 bg-white dark:bg-[#101a22]" id="contacto">
            <div class="max-w-[960px] mx-auto">
                <div class="flex flex-col md:flex-row gap-8 bg-background-light dark:bg-[#152028] rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Contact Info */}
                    <div class="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <h2 class="text-2xl font-bold mb-6">Visítenos</h2>
                        <div class="space-y-6">
                            <div class="flex gap-4">
                                <div class="bg-primary/10 text-primary p-2 rounded-lg h-fit">
                                    <span class="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg">Dirección</h3>
                                    <p class="text-gray-600 dark:text-gray-400">Av. San Martín 1234, Taller N° 5<br/>Ciudad, Provincia</p>
                                </div>
                            </div>
                             <div class="flex gap-4">
                                <div class="bg-primary/10 text-primary p-2 rounded-lg h-fit">
                                    <span class="material-symbols-outlined">schedule</span>
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg">Horario de Atención</h3>
                                    <p class="text-gray-600 dark:text-gray-400">Lunes a Viernes: 08:00 - 18:00 hs<br/>Sábados: 08:00 - 13:00 hs</p>
                                </div>
                            </div>
                            <div class="flex gap-4">
                                <div class="bg-primary/10 text-primary p-2 rounded-lg h-fit">
                                    <span class="material-symbols-outlined">call</span>
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg">Teléfono</h3>
                                    <p class="text-gray-600 dark:text-gray-400 text-lg font-medium hover:text-primary cursor-pointer">+54 9 11 1234-5678</p>
                                    <p class="text-sm text-gray-500 mt-1">Atendemos WhatsApp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     {/* Map */}
                    <div class="flex-1 min-h-[300px] md:min-h-auto relative bg-gray-200">
                         <div class="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500" style={{backgroundImage: 'url("https://placeholder.pics/svg/300")'}}>
                             <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div class="bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1 rounded shadow-lg border border-gray-200">
                                        MAPA INTERACTIVO
                                  </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer class="bg-white dark:bg-[#101a22] border-t border-gray-200 dark:border-gray-800 py-10 px-4 md:px-10 text-center md:text-left">
        <div class="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">electric_bolt</span>
            <span class="font-bold text-lg">Taller Charli</span>
          </div>
          <div class="flex gap-6 text-sm text-gray-600 dark:text-gray-400 font-medium">
            <a class="hover:text-primary" href="#">Inicio</a>
            <a class="hover:text-primary" href="#">Servicios</a>
            <a class="hover:text-primary" href="#">Política de Privacidad</a>
          </div>
          <div class="text-sm text-gray-400">
            © 2023 Taller Charli. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;