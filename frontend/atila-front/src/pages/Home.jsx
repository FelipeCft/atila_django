import React from 'react';
import { ArrowRight, Shield, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PolygonalBackground from '../components/common/PolygonalBackground';
import HeroSlider from '../components/home/HeroSlider';
import doctor1 from '../assets/doctor1.png';
import doctor2 from '../assets/doctor2.png';

const Home = () => {
    const heroImages = [doctor1, doctor2];
    return (
        <PolygonalBackground>
            {/* Hero Section */}
            <section className="relative pt-32 md:pt-48 pb-20 overflow-hidden bg-transparent">
                {/* WaveBackground removed as per user request */}

                <div className="container-custom relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
                    <div className="lg:col-span-7 max-w-2xl lg:max-w-none pr-0 xl:pr-8">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-5 animate-fade-in backdrop-blur-sm border border-white/10">
                            Bienvenido a la Excelencia Médica
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl xl:text-[5rem] font-bold mb-6 leading-tight text-white">
                            Tu Salud es Nuestra <span className="text-sky-400 italic">Prioridad</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                            En Atila Centro Médico combinamos tecnología de vanguardia con un equipo humano excepcional para brindarte la mejor atención médica personalizada.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/servicios" className="btn btn-primary px-7 py-3.5 text-lg shadow-xl shadow-sky-500/20">
                                Ver Servicios
                                <ArrowRight size={20} />
                            </Link>
                            <button
                                onClick={() => document.getElementById('atila-chat-button')?.click()}
                                className="btn btn-outline px-7 py-3.5 text-lg border-slate-700 text-white hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300 bg-transparent text-center"
                            >
                                Agenda tu Cita
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-5 w-full relative z-10 mt-0 lg:-mt-16">
                        <HeroSlider images={heroImages} />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative pb-24 bg-transparent pt-10">
                <div className="container-custom relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">¿Por qué elegirnos?</h2>
                        <div className="w-20 h-1.5 bg-sky-500 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Shield className="text-sky-400" size={36} />,
                                title: "Calidad Garantizada",
                                desc: "Equipos de última generación y procesos certificados internacionalmente para tu seguridad."
                            },
                            {
                                icon: <Clock className="text-sky-400" size={36} />,
                                title: "Atención Rápida",
                                desc: "Entendemos el valor de tu tiempo. Minimizamos las esperas con sistemas de gestión eficientes."
                            },
                            {
                                icon: <Users className="text-sky-400" size={36} />,
                                title: "Equipo Experto",
                                desc: "Especialistas en constante formación dirigidos por los mejores profesionales del sector."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-10 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500">
                                <div className="mb-8 p-4 bg-sky-500/10 w-fit rounded-2xl group-hover:bg-sky-500 group-hover:text-white transition-colors duration-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-inter">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PolygonalBackground>
    );
};

export default Home;
